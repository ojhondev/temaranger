import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { listings, marketplace, vehicles, type Marketplace, type Vehicle } from "@/db/schema";

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

/**
 * Leva os anúncios de um veículo ao estado desejado:
 * disponível + ligado → publicado · reservado → pausado · vendido ou desligado → removido.
 */
export async function syncVehicle(tenantId: number, vehicleId: number) {
  const [v] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)));
  if (!v) return;

  const rows = await db.select().from(listings).where(eq(listings.vehicleId, v.id));

  for (const l of rows) {
    const adapter = adapters[l.marketplace];
    const target =
      !l.enabled || v.status === "sold" ? "removed" : v.status === "reserved" ? "paused" : "published";
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
