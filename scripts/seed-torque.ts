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
  const { HERO_BANNERS, fill } = await import("../src/config/ranger");
  const { applyAccountRules } = await import("../src/lib/marketplaces");

  const [t] = await db.select().from(tenants).where(eq(tenants.slug, "demo"));
  if (!t) throw new Error("Rode npm run db:seed antes.");

  const existing = await db.select().from(banners).where(eq(banners.tenantId, t.id));
  if (!existing.length) {
    await db.insert(banners).values([
      ...HERO_BANNERS.map((b, i) => ({
        tenantId: t.id,
        placement: "hero" as const,
        title: fill(b.title, t.name),
        subtitle: fill(b.subtitle, t.name),
        ctaLabel: b.cta,
        href: b.href,
        position: i,
      })),
      { tenantId: t.id, placement: "promo" as const, heading: "Vai comprar ou vender?", title: "Preços pela Tabela FIPE", subtitle: "Confira para negociar", ctaLabel: "Ver agora", href: "/estoque?ordem=menor-preco", position: 0 },
      { tenantId: t.id, placement: "promo" as const, heading: "Financie com a gente", title: "Você de carro novo", subtitle: "Parcelas que cabem no bolso", ctaLabel: "Ver ofertas", href: "/estoque", position: 1 },
    ]);
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
