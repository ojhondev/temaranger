import Link from "next/link";
import { Filter, Info, MessagesSquare, Plus, SquareCheckBig } from "lucide-react";

import { Panel } from "@/components/torque/ui";
import { getCrm } from "@/db/torque-queries";
import { isManager, requireSession } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "CRM" };

const TEAL = "#14958f";
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Sao_Paulo" });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium", timeZone: "America/Sao_Paulo" });

function waitingFor(d: Date) {
  const hours = Math.floor((Date.now() - d.getTime()) / 3_600_000);
  if (hours < 1) return "HÁ MENOS DE 1 HORA";
  if (hours < 24) return `HÁ ${hours} HORA${hours > 1 ? "S" : ""}`;
  const days = Math.floor(hours / 24);
  return `HÁ MAIS DE ${days} DIA${days > 1 ? "S" : ""}`;
}

export default async function CrmPainel() {
  const s = await requireSession();
  const tenant = await getTenant();
  const manager = isManager(s);
  const crm = await getCrm(tenant.id, manager ? undefined : s.user.id);

  const f = crm.funnel;
  const funnel = [
    { label: "Leads recebidos", n: (f.new ?? 0) + (f.in_progress ?? 0) + (f.won ?? 0) + (f.lost ?? 0) },
    { label: "Em atendimento", n: (f.in_progress ?? 0) + (f.won ?? 0) },
    { label: "Vendas", n: f.won ?? 0 },
  ];
  const max = Math.max(1, funnel[0].n);

  return (
    <div className="-mx-4 -mt-6 min-h-full bg-[#f3f3f6] md:-mx-8">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-4 py-6 md:px-8">
        <h1 className="text-2xl font-semibold">Painel</h1>
        <Link
          href="/torque/crm/novo"
          data-tour="novo-lead"
          className="flex h-11 items-center gap-2 rounded-md border px-5 text-sm font-semibold"
          style={{ borderColor: TEAL, color: TEAL }}
        >
          <Plus className="size-4" /> Criar novo lead
        </Link>
      </div>

      <div className="grid gap-4 px-4 py-5 md:px-8 xl:grid-cols-[1fr_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel data-tour="fila">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MessagesSquare className="size-5 text-primary" /> Distribuição por Fila comum
                <Info className="size-4" style={{ color: TEAL }} />
              </p>
              <p className="text-right text-xs text-[#6b6b76]">
                Última atualização {timeFmt.format(new Date())}
                <br />
                Dados referentes aos últimos 30 dias
              </p>
            </div>
            <p className="mt-4 flex gap-3 rounded-md bg-[#3478f6] px-4 py-3 text-sm text-white">
              <Info className="mt-0.5 size-4 shrink-0" />
              A fila comum é dinâmica: cada vez que um vendedor recebe um lead, ele vai para o final da fila. Quem está há
              mais tempo sem receber é o próximo.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-center text-[11px] uppercase tracking-wide text-[#6b6b76]">
                    <th className="py-3 text-left font-medium">Vendedor</th>
                    <th className="py-3 font-medium">Última atividade</th>
                    <th className="py-3 font-medium">Leads sem resposta</th>
                    <th className="py-3 font-medium">Negociações em andamento</th>
                    <th className="py-3 font-medium">Vendas</th>
                    <th className="py-3 font-medium">Taxa de conversão</th>
                  </tr>
                </thead>
                <tbody>
                  {crm.queue.map((q, i) => (
                    <tr key={q.id} className={`border-t text-center ${q.active ? "" : "opacity-50"}`}>
                      <td className="py-4 text-left">
                        {i + 1}. {q.name}
                        {!q.active && <span className="ml-2 text-xs text-[#6b6b76]">(fora do rodízio)</span>}
                      </td>
                      <td className="py-4">{q.lastActivity ? dateFmt.format(new Date(q.lastActivity)) : "—"}</td>
                      <td className={`py-4 ${q.fresh ? "font-semibold text-primary" : ""}`}>{q.fresh}</td>
                      <td className="py-4">{q.open}</td>
                      <td className="py-4">{q.won}</td>
                      <td className="py-4">{q.total ? Math.round((q.won / q.total) * 100) : 0}%</td>
                    </tr>
                  ))}
                  {crm.queue.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#6b6b76]">
                        Nenhum vendedor cadastrado. <Link href="/torque/equipe" className="font-semibold text-primary">Cadastrar equipe</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Link
              href="/torque/crm/leads"
              className="mt-4 inline-flex h-10 items-center rounded-md border px-5 text-sm font-semibold"
              style={{ borderColor: TEAL, color: TEAL }}
            >
              Ver todos
            </Link>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <MessagesSquare className="size-5 text-primary" /> Clientes aguardando resposta
              </p>
              <div className="mt-4 flex items-center gap-6">
                <Link href="/torque/crm/leads?status=new" className="text-[64px] font-semibold leading-none hover:text-primary">
                  {crm.totals.fresh}
                </Link>
                <div className="border-l pl-5 text-sm leading-7">
                  <p>
                    <b>{crm.totals.fresh}</b> <span className="text-[#6b6b76]">Novos leads</span>
                  </p>
                  <p>
                    <b>{crm.totals.open}</b> <span className="text-[#6b6b76]">Em negociação</span>
                  </p>
                </div>
              </div>
            </Panel>
            <Panel>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Filter className="size-5 text-primary" /> Performance {manager ? "da minha loja" : "minha"}
                <span className="text-xs font-normal text-[#6b6b76]">· últimos 30 dias</span>
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {funnel.map((st, i) => (
                  <div key={st.label} className="flex items-center gap-3 text-sm">
                    <div className="h-8 rounded" style={{ width: `${Math.max(8, (st.n / max) * 100)}%`, background: ["#2a2a33", "#e3173e", "#14958f"][i] }} />
                    <span className="shrink-0 font-semibold tabular-nums">{st.n}</span>
                    <span className="shrink-0 text-[#6b6b76]">{st.label}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <Panel className="self-start" data-tour="atividades">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <SquareCheckBig className="size-5 text-primary" /> Minhas atividades do dia
            <span className="font-normal text-[#6b6b76]">{crm.waiting.length}</span>
          </p>
          <ul className="mt-4 flex flex-col">
            {crm.waiting.length === 0 && <li className="py-6 text-center text-sm text-[#6b6b76]">Nenhum cliente esperando. 🏁</li>}
            {crm.waiting.map(({ lead, vehicle }) => (
              <li key={lead.id} className="border-l-2 border-primary py-3 pl-4 [&+li]:border-t">
                <p className="flex gap-2 text-[13px]">
                  <MessagesSquare className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <b>{lead.name}</b> <span className="text-[#6b6b76]">está negociando o</span>{" "}
                    {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}`.toUpperCase() : "veículo não identificado"}
                  </span>
                </p>
                <div className="mt-1 flex items-center justify-between pl-6">
                  <span className="text-[10px] font-bold text-primary">{waitingFor(lead.createdAt)}</span>
                  {lead.phone ? (
                    <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold" style={{ color: TEAL }}>
                      Responder
                    </a>
                  ) : (
                    <Link href={`/torque/crm/leads?status=new`} className="text-xs font-semibold" style={{ color: TEAL }}>
                      Ver lead
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
