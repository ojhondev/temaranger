import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboard } from "@/db/queries";
import { CHANNELS, brl, daysSince } from "@/lib/format";
import { getTenant } from "@/lib/tenant";

const BUCKETS = [
  { label: "Até 30 dias", min: 0, max: 30, tone: "bg-emerald-500" },
  { label: "31 a 60 dias", min: 31, max: 60, tone: "bg-amber-400" },
  { label: "61 a 90 dias", min: 61, max: 90, tone: "bg-orange-500" },
  { label: "Mais de 90 dias", min: 91, max: Infinity, tone: "bg-red-600" },
];

export default async function Dashboard() {
  const tenant = await getTenant();
  const d = await getDashboard(tenant.id);
  const maxChannel = Math.max(1, ...d.byChannel.map((c) => c.total));
  const aged = d.stock.filter((v) => daysSince(v.stockedAt) > 60);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight">Visão geral</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Leads (30 dias)" value={d.totals.leads} />
        <Stat label="Sem atendimento" value={d.totals.fresh} href="/painel/leads?status=new" alert={d.totals.fresh > 0} />
        <Stat label="Vendas (30 dias)" value={d.totals.won} />
        <Stat label="Carros em estoque" value={d.stock.length} href="/painel/estoque" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads por canal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {d.byChannel.map((c) => (
              <div key={c.channel} className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-sm">
                <span>{CHANNELS[c.channel]}</span>
                <div className="h-3 rounded-full bg-muted">
                  <div className="h-3 rounded-full bg-primary" style={{ width: `${(c.total / maxChannel) * 100}%` }} />
                </div>
                <span className="text-right font-semibold tabular-nums">{c.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads por vendedor</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">Vendedor</th>
                  <th className="pb-2 text-right font-medium">Leads</th>
                  <th className="pb-2 text-right font-medium">Sem resposta</th>
                  <th className="pb-2 text-right font-medium">Vendas</th>
                </tr>
              </thead>
              <tbody>
                {d.bySeller.map((s) => (
                  <tr key={s.name} className="border-t">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2 text-right tabular-nums">{s.total}</td>
                    <td className={`py-2 text-right tabular-nums ${s.open ? "font-semibold text-destructive" : ""}`}>
                      {s.open}
                    </td>
                    <td className="py-2 text-right tabular-nums">{s.won}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Idade do estoque</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-4">
            {BUCKETS.map((b) => {
              const n = d.stock.filter((v) => {
                const age = daysSince(v.stockedAt);
                return age >= b.min && age <= b.max;
              }).length;
              return (
                <div key={b.label} className="rounded-lg border p-4">
                  <div className={`mb-2 h-1.5 w-10 rounded-full ${b.tone}`} />
                  <p className="text-2xl font-bold tabular-nums">{n}</p>
                  <p className="text-sm text-muted-foreground">{b.label}</p>
                </div>
              );
            })}
          </div>
          {aged.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">Parados há mais de 60 dias</p>
              <ul className="divide-y rounded-lg border text-sm">
                {aged.map((v) => (
                  <li key={v.id}>
                    <Link href={`/painel/estoque/${v.id}`} className="flex justify-between gap-4 px-4 py-2 hover:bg-muted">
                      <span>
                        {v.brand} {v.model} {v.year} · {brl(v.price)}
                      </span>
                      <span className="font-semibold text-destructive">{daysSince(v.stockedAt)} dias</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, href, alert }: { label: string; value: number; href?: string; alert?: boolean }) {
  const body = (
    <Card className="h-full">
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 font-heading text-4xl font-extrabold tabular-nums ${alert ? "text-destructive" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
