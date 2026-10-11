"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { listings, marketplace, marketplaceAccounts, type Marketplace } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { createLead } from "@/lib/leads";
import { applyAccountRules, resyncMarketplace } from "@/lib/marketplaces";

const MANAGERS = ["master", "manager"] as const;
const valid = (mp: string): mp is Marketplace => (marketplace.enumValues as readonly string[]).includes(mp);

export type ConnectResult = { ok: true; published: number } | { ok: false; error: string };

/**
 * Passo final do assistente: grava a conta e as regras e publica o estoque.
 * Os adaptadores ainda são simulados (ver lib/marketplaces): a conta real entra quando
 * o credenciamento de integrador da SoftMotors em cada portal for concluído.
 */
export async function connectMarketplace(input: {
  marketplace: string;
  accountName: string;
  scope: "all" | "manual";
  minPrice?: number;
  maxPrice?: number;
}): Promise<ConnectResult> {
  const s = await requireSession([...MANAGERS]);
  if (!valid(input.marketplace)) return { ok: false, error: "Portal inválido." };
  const accountName = input.accountName.trim().slice(0, 120);
  if (!accountName) return { ok: false, error: "Informe a conta da loja no portal." };

  const rules = {
    scope: input.scope === "manual" ? ("manual" as const) : ("all" as const),
    ...(input.minPrice ? { minPrice: Math.max(0, Math.round(input.minPrice)) } : {}),
    ...(input.maxPrice ? { maxPrice: Math.max(0, Math.round(input.maxPrice)) } : {}),
  };
  await db
    .insert(marketplaceAccounts)
    .values({ tenantId: s.tenantId, marketplace: input.marketplace, accountName, rules, status: "connected", connectedAt: new Date(), lastSyncAt: new Date() })
    .onConflictDoUpdate({
      target: [marketplaceAccounts.tenantId, marketplaceAccounts.marketplace],
      set: { accountName, rules, status: "connected", connectedAt: new Date(), lastSyncAt: new Date() },
    });

  const published = await applyAccountRules(s.tenantId, undefined, input.marketplace);
  return { ok: true, published };
}

export async function disconnectMarketplace(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const mp = String(fd.get("marketplace"));
  if (!valid(mp)) return;
  await db
    .update(marketplaceAccounts)
    .set({ status: "disconnected" })
    .where(and(eq(marketplaceAccounts.tenantId, s.tenantId), eq(marketplaceAccounts.marketplace, mp)));
  await resyncMarketplace(s.tenantId, mp);
  revalidatePath("/torque", "layout");
}

export async function resyncNow(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const mp = String(fd.get("marketplace"));
  if (!valid(mp)) return;
  await applyAccountRules(s.tenantId, undefined, mp);
  await resyncMarketplace(s.tenantId, mp);
  revalidatePath("/torque", "layout");
}

/** Demonstração: gera um lead como se tivesse chegado pelo portal. */
export async function testPortalLead(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const mp = String(fd.get("marketplace"));
  if (!valid(mp)) return;
  const [l] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.tenantId, s.tenantId), eq(listings.marketplace, mp), eq(listings.status, "published")))
    .orderBy(sql`random()`)
    .limit(1);
  if (!l) return;
  const names = ["Marcos Vieira", "Sabrina Lopes", "Henrique Faria", "Tatiane Rezende", "Otávio Brito"];
  await createLead({
    tenantId: s.tenantId,
    vehicleId: l.vehicleId,
    channel: mp,
    name: names[Math.floor(Math.random() * names.length)],
    phone: `55119${Math.floor(10000000 + Math.random() * 89999999)}`,
    message: "Ainda está disponível? (lead de teste)",
  });
  revalidatePath("/torque", "layout");
}
