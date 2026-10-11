import { and, eq, gte, ne, sql } from "drizzle-orm";
import { Info, RefreshCw, Zap } from "lucide-react";

import { disconnectMarketplace, resyncNow, testPortalLead } from "@/app/torque/actions/marketplaces";
import { ConnectWizard } from "@/components/torque/connect-wizard";
import { PortalLogo } from "@/components/torque/portal-logo";
import { PageHeader, Panel } from "@/components/torque/ui";
import { db } from "@/db";
import { leads, listings, marketplaceAccounts, vehicles, type Marketplace } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { MARKETPLACES, publishedAt } from "@/lib/format";
import { ALL_MARKETPLACES } from "@/lib/marketplaces";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

export const metadata = { title: "Marketplaces" };

export default async function Marketplaces() {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const since = new Date(Date.now() - 30 * 86_400_000);

  const [accounts, stats, leadStats, stock] = await Promise.all([
    db.select().from(marketplaceAccounts).where(eq(marketplaceAccounts.tenantId, tenant.id)),
    db
      .select({ mp: listings.marketplace, status: listings.status, n: sql<number>`count(*)::int` })
      .from(listings)
      .where(eq(listings.tenantId, tenant.id))
      .groupBy(listings.marketplace, listings.status),
    db
      .select({ ch: leads.channel, n: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(eq(leads.tenantId, tenant.id), gte(leads.createdAt, since)))
      .groupBy(leads.channel),
    db
      .select({ price: vehicles.price })
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenant.id), ne(vehicles.status, "sold"))),
  ]);

  const count = (mp: Marketplace, status: string) => stats.find((s) => s.mp === mp && s.status === status)?.n ?? 0;
  const leadsOf = (mp: Marketplace) => leadStats.find((l) => l.ch === mp)?.n ?? 0;
  const prices = stock.map((s) => s.price);

  return (
    <div>
      <PageHeader title="Marketplaces" kicker="Anuncie todo o estoque nos maiores portais" />

      <ol className="mb-6 grid gap-3 md:grid-cols-3">
        {[
          ["1", "Conecte a conta da loja", "Uma vez por portal."],
          ["2", "Escolha o que anunciar", "Todo o estoque ou carro a carro."],
          ["3", "Pronto", "Anúncios criados, atualizados e removidos sozinhos."],
        ].map(([n, t, d]) => (
          <li key={n} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(16,16,24,.06)]">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">{n}</span>
            <span>
              <span className="block text-sm font-semibold">{t}</span>
              <span className="text-xs text-[#6b6b76]">{d}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 lg:grid-cols-3" data-tour="portais">
        {ALL_MARKETPLACES.map((mp) => {
          const acc = accounts.find((a) => a.marketplace === mp);
          const on = acc?.status === "connected";
          return (
            <Panel key={mp} className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <PortalLogo mp={mp} className="h-14 min-w-32 text-lg" />
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    on ? "bg-[#e7f7ed] text-[#1d6b3d]" : "bg-[#f0f0f4] text-[#6b6b76]",
                  )}
                >
                  {on ? "Conectado" : "Não conectado"}
                </span>
              </div>
              {on ? (
                <>
                  <p className="text-xs text-[#6b6b76]">
                    Conta: <b className="text-[#1f1f28]">{acc.accountName}</b> ·{" "}
                    {acc.rules.scope === "all" ? "todo o estoque" : "carro a carro"}
                    {acc.rules.minPrice ? ` · a partir de R$ ${acc.rules.minPrice.toLocaleString("pt-BR")}` : ""}
                    {acc.rules.maxPrice ? ` · até R$ ${acc.rules.maxPrice.toLocaleString("pt-BR")}` : ""}
                  </p>
                  <dl className="grid grid-cols-3 gap-2 text-center">
                    {[
                      ["Ativos", count(mp, "published")],
                      ["Com erro", count(mp, "error")],
                      ["Leads 30d", leadsOf(mp)],
                    ].map(([l, n]) => (
                      <div key={l} className="rounded-lg bg-[#f5f5f7] py-3">
                        <dd className={cn("text-xl font-semibold", l === "Com erro" && Number(n) > 0 && "text-primary")}>{n}</dd>
                        <dt className="text-[11px] text-[#6b6b76]">{l}</dt>
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-[#6b6b76]">Última sincronização: {acc.lastSyncAt ? publishedAt(acc.lastSyncAt) : "—"}</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <form action={resyncNow}>
                      <input type="hidden" name="marketplace" value={mp} />
                      <button className="flex h-10 items-center gap-1.5 rounded-lg bg-[#2a2a33] px-4 text-sm font-semibold text-white">
                        <RefreshCw className="size-4" /> Sincronizar agora
                      </button>
                    </form>
                    <ConnectWizard mp={mp} storeName={tenant.name} prices={prices} label="Regras" variant="outline" />
                    <form action={disconnectMarketplace}>
                      <input type="hidden" name="marketplace" value={mp} />
                      <button className="h-10 px-2 text-sm font-medium text-primary hover:underline">Desconectar</button>
                    </form>
                  </div>
                  <form action={testPortalLead} className="border-t pt-3">
                    <input type="hidden" name="marketplace" value={mp} />
                    <button className="flex items-center gap-1.5 text-xs font-medium text-[#6b6b76] hover:text-[#1f1f28]">
                      <Zap className="size-3.5" /> Testar recebimento de lead
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#4a4a55]">
                    Publique {prices.length} {prices.length === 1 ? "veículo" : "veículos"} no {MARKETPLACES[mp]} e receba os leads aqui no CRM.
                  </p>
                  <div className="mt-auto">
                    <ConnectWizard mp={mp} storeName={tenant.name} prices={prices} />
                  </div>
                </>
              )}
            </Panel>
          );
        })}
      </div>

      <Panel className="mt-5" data-tour="resumo-portais">
        <h2 className="text-base font-semibold">Resumo dos últimos 30 dias</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-[#6b6b76]">
              <tr>
                <th className="py-2 font-medium">Portal</th>
                <th className="py-2 text-right font-medium">Ativos</th>
                <th className="py-2 text-right font-medium">Pausados</th>
                <th className="py-2 text-right font-medium">Com erro</th>
                <th className="py-2 text-right font-medium">Leads</th>
              </tr>
            </thead>
            <tbody>
              {ALL_MARKETPLACES.map((mp) => (
                <tr key={mp} className="border-t">
                  <td className="py-2.5 font-medium">{MARKETPLACES[mp]}</td>
                  <td className="py-2.5 text-right tabular-nums">{count(mp, "published")}</td>
                  <td className="py-2.5 text-right tabular-nums">{count(mp, "paused")}</td>
                  <td className="py-2.5 text-right tabular-nums">{count(mp, "error")}</td>
                  <td className="py-2.5 text-right tabular-nums">{leadsOf(mp)}</td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="py-2.5">Seu site</td>
                <td className="py-2.5 text-right tabular-nums">{prices.length}</td>
                <td />
                <td />
                <td className="py-2.5 text-right tabular-nums">{(leadStats.find((l) => l.ch === "site")?.n ?? 0) + (leadStats.find((l) => l.ch === "whatsapp")?.n ?? 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="mt-5 flex gap-2 text-xs text-[#6b6b76]">
        <Info className="mt-0.5 size-4 shrink-0" />
        Ambiente de demonstração: a conexão com os portais está simulada. A publicação real é ativada pela SoftMotors assim que o
        credenciamento de integrador em cada portal for concluído; o fluxo para a loja continua o mesmo.
      </p>
    </div>
  );
}
