/**
 * Dados do Torque para o tenant demo (idempotente): banners editáveis a partir dos padrões
 * do tema e OLX + Mercado Livre conectados. A WebMotors fica livre para testar o assistente.
 * Uso: npx tsx scripts/seed-torque.ts
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../src/db/index");
  const { banners, marketplaceAccounts, tenants } = await import("../src/db/schema");
  const { defaultBanners } = await import("../src/lib/provision");
  const { applyAccountRules } = await import("../src/lib/marketplaces");

  const [t] = await db.select().from(tenants).where(eq(tenants.slug, "template"));
  if (!t) throw new Error("Rode npm run db:seed antes.");

  const existing = await db.select().from(banners).where(eq(banners.tenantId, t.id));
  if (!existing.length) {
    await db.insert(banners).values(defaultBanners(t));
    console.log("Banners criados.");
  }

  const accounts = await db.select().from(marketplaceAccounts).where(eq(marketplaceAccounts.tenantId, t.id));
  if (!accounts.length) {
    const now = new Date();
    await db.insert(marketplaceAccounts).values([
      { tenantId: t.id, marketplace: "olx" as const, accountName: "loja@softmotors.demo", rules: { scope: "all" as const }, connectedAt: now, lastSyncAt: now },
      { tenantId: t.id, marketplace: "mercadolivre" as const, accountName: "SOFTMOTORS.DEMO", rules: { scope: "all" as const }, connectedAt: now, lastSyncAt: now },
    ]);
    console.log("OLX e Mercado Livre conectados.");
  }
  const n = await applyAccountRules(t.id);
  console.log(`${n} anúncios ativos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
