import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  listings,
  marketplace,
  marketplaceAccounts,
  vehicles,
  type Marketplace,
  type Listing,
  type MarketplaceAccount,
  type Vehicle,
} from "@/db/schema";

export interface MarketplaceAdapter {
  publish(v: Vehicle): Promise<{ externalId: string }>;
  update(externalId: string, v: Vehicle): Promise<void>;
  pause(externalId: string): Promise<void>;
  unpublish(externalId: string): Promise<void>;
}

/**
 * Adaptador simulado: devolve o que a API real devolveria, sem chamar o portal.
 * Trocar por implementações reais conforme o credenciamento de integrador sair.
 */
function mockAdapter(prefix: string): MarketplaceAdapter {
  return {
    async publish(v) {
      return { externalId: `${prefix}-${v.tenantId}-${v.id}` };
    },
    async update() {},
    async pause() {},
    async unpublish() {},
  };
}

export const adapters: Record<Marketplace, MarketplaceAdapter> = {
  olx: mockAdapter("OLX"),
  webmotors: mockAdapter("WM"),
  mercadolivre: mockAdapter("MLB"),
};

export const ALL_MARKETPLACES = marketplace.enumValues;

/** Portais conectados da loja (marketplace → conta). */
async function connectedAccounts(tenantId: number) {
  const rows = await db
    .select()
    .from(marketplaceAccounts)
    .where(and(eq(marketplaceAccounts.tenantId, tenantId), eq(marketplaceAccounts.status, "connected")));
  return new Map(rows.map((a) => [a.marketplace, a]));
}

/**
 * Leva os anúncios de um veículo ao estado desejado:
 * portal conectado + ligado + disponível → publicado · reservado → pausado ·
 * vendido, desligado ou portal desconectado → removido.
 */
export async function syncVehicle(
  tenantId: number,
  vehicleId: number,
  accounts?: Map<Marketplace, MarketplaceAccount>,
  preload?: { vehicle: Vehicle; listings: Listing[]; force?: boolean },
) {
  const v =
    preload?.vehicle ??
    (await db
      .select()
      .from(vehicles)
      .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId))))[0];
  if (!v) return;
  const conn = accounts ?? (await connectedAccounts(tenantId));

  const rows = preload?.listings ?? (await db.select().from(listings).where(eq(listings.vehicleId, v.id)));

  for (const l of rows) {
    const adapter = adapters[l.marketplace];
    const target =
      !l.enabled || !conn.has(l.marketplace) || v.status === "sold"
        ? "removed"
        : v.status === "reserved"
          ? "paused"
          : "published";
    // Nada mudou: não chama o portal nem o banco.
    if (target === l.status && (target !== "published" || (preload && !preload.force))) continue;
    try {
      let externalId = l.externalId;
      if (target === "published") {
        if (externalId && l.status !== "removed") await adapter.update(externalId, v);
        else externalId = (await adapter.publish(v)).externalId;
      } else if (externalId && l.status !== "removed") {
        if (target === "paused") await adapter.pause(externalId);
        else await adapter.unpublish(externalId);
      }
      await db
        .update(listings)
        .set({ status: target, externalId, syncedAt: new Date(), lastError: null })
        .where(eq(listings.id, l.id));
    } catch (e) {
      await db
        .update(listings)
        .set({ status: "error", lastError: e instanceof Error ? e.message : String(e) })
        .where(eq(listings.id, l.id));
    }
  }
}

/** Liga/desliga um portal para o veículo e sincroniza. */
export async function setListing(
  tenantId: number,
  vehicleId: number,
  mp: Marketplace,
  enabled: boolean,
) {
  await db
    .insert(listings)
    .values({ tenantId, vehicleId, marketplace: mp, enabled })
    .onConflictDoUpdate({ target: [listings.vehicleId, listings.marketplace], set: { enabled } });
  await syncVehicle(tenantId, vehicleId);
}

/**
 * Aplica as regras dos portais conectados ("todo o estoque", faixa de preço) aos veículos
 * indicados (ou a todos) e sincroniza. Devolve quantos anúncios ficaram ativos.
 */
export async function applyAccountRules(tenantId: number, vehicleIds?: number[], only?: Marketplace) {
  const conn = await connectedAccounts(tenantId);
  const list = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.tenantId, tenantId), vehicleIds ? inArray(vehicles.id, vehicleIds) : undefined));

  // Um único upsert com a decisão de cada veículo × portal ("todo o estoque" + faixa de preço).
  const rows = list.flatMap((v) =>
    [...conn]
      .filter(([mp, acc]) => (!only || mp === only) && acc.rules.scope === "all")
      .map(([mp, acc]) => ({
        tenantId,
        vehicleId: v.id,
        marketplace: mp,
        enabled: (!acc.rules.minPrice || v.price >= acc.rules.minPrice) && (!acc.rules.maxPrice || v.price <= acc.rules.maxPrice),
      })),
  );
  if (rows.length) {
    await db
      .insert(listings)
      .values(rows)
      .onConflictDoUpdate({ target: [listings.vehicleId, listings.marketplace], set: { enabled: sql`excluded.enabled` } });
  }

  // Sincroniza em lotes paralelos, com veículos e anúncios já carregados (2 consultas no total).
  await syncMany(tenantId, list, conn);

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(listings)
    .where(and(eq(listings.tenantId, tenantId), eq(listings.status, "published"), only ? eq(listings.marketplace, only) : undefined));
  return n;
}

async function syncMany(tenantId: number, list: Vehicle[], conn: Map<Marketplace, MarketplaceAccount>, force = false) {
  if (!list.length) return;
  const all = await db.select().from(listings).where(and(eq(listings.tenantId, tenantId), inArray(listings.vehicleId, list.map((v) => v.id))));
  for (let i = 0; i < list.length; i += 10) {
    await Promise.all(
      list.slice(i, i + 10).map((v) => syncVehicle(tenantId, v.id, conn, { vehicle: v, listings: all.filter((l) => l.vehicleId === v.id), force })),
    );
  }
}

/** Re-sincroniza todos os anúncios de um portal (botão "Sincronizar agora"). */
export async function resyncMarketplace(tenantId: number, mp: Marketplace) {
  const rows = await db
    .selectDistinct({ id: listings.vehicleId })
    .from(listings)
    .where(and(eq(listings.tenantId, tenantId), eq(listings.marketplace, mp)));
  const conn = await connectedAccounts(tenantId);
  const list = rows.length
    ? await db.select().from(vehicles).where(and(eq(vehicles.tenantId, tenantId), inArray(vehicles.id, rows.map((r) => r.id))))
    : [];
  await syncMany(tenantId, list, conn, true);
  await db
    .update(marketplaceAccounts)
    .set({ lastSyncAt: new Date() })
    .where(and(eq(marketplaceAccounts.tenantId, tenantId), eq(marketplaceAccounts.marketplace, mp)));
}
