import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";

import { updateLead } from "@/app/torque/actions/crm";
import { LeadStatusBadge } from "@/components/torque/status-badge";
import { PageHeader, Saved } from "@/components/torque/ui";
import { listLeads, listSellers, type LeadFilters } from "@/db/queries";
import { leadChannel, leadStatus } from "@/db/schema";
import { CHANNELS, LEAD_STATUS } from "@/lib/format";
import { isManager, requireSession } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Leads" };

const SELECT = "h-10 rounded-lg border border-[#d6d6dc] bg-white px-3 text-sm";
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export default async function Leads({ searchParams }: { searchParams: Promise<LeadFilters & { criado?: string }> }) {
  const f = await searchParams;
  const s = await requireSession();
  const tenant = await getTenant();
  const manager = isManager(s);
  const [rows, sellers] = await Promise.all([listLeads(tenant.id, f, manager ? undefined : s.user.id), listSellers(tenant.id)]);

  return (
    <div>
      <PageHeader title={manager ? "Leads" : "Meus leads"} kicker="CRM">
        <Link href="/torque/crm/novo" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white">
          <Plus className="size-4" /> Criar lead
        </Link>
      </PageHeader>
      <Saved show={!!f.criado}>Lead criado e distribuído na fila.</Saved>

      <form className="mb-5 flex flex-wrap gap-2" data-tour="leads-filtros">
        <select name="status" defaultValue={f.status ?? ""} className={SELECT}>
          <option value="">Todos os status</option>
          {leadStatus.enumValues.map((v) => (
            <option key={v} value={v}>
              {LEAD_STATUS[v]}
            </option>
          ))}
        </select>
        <select name="canal" defaultValue={f.canal ?? ""} className={SELECT}>
          <option value="">Todos os canais</option>
          {leadChannel.enumValues.map((c) => (
            <option key={c} value={c}>
              {CHANNELS[c]}
            </option>
          ))}
        </select>
        {manager && (
          <select name="vendedor" defaultValue={f.vendedor ?? ""} className={SELECT}>
            <option value="">Todos os vendedores</option>
            {sellers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        )}
        <button className="h-10 rounded-lg bg-[#2a2a33] px-5 text-sm font-semibold text-white">Filtrar</button>
        <Link href="/torque/crm/leads" className="self-center px-2 text-sm text-[#6b6b76] hover:underline">
          Limpar
        </Link>
      </form>

      <div className="flex flex-col gap-3" data-tour="leads-lista">
        {rows.length === 0 && <p className="rounded-xl bg-white p-10 text-center text-[#6b6b76]">Nenhum lead com esses filtros.</p>}
        {rows.map(({ lead, vehicle, seller }) => (
          <div key={lead.id} className="grid gap-3 rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(16,16,24,.06)] lg:grid-cols-[1.3fr_1fr_auto] lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{lead.name}</p>
                <LeadStatusBadge status={lead.status} />
                <span className="rounded bg-[#f0f0f4] px-1.5 py-0.5 text-xs font-medium">{CHANNELS[lead.channel]}</span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-[#6b6b76]">
                {dateFmt.format(lead.createdAt)}
                {lead.phone && (
                  <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium text-[#1c9b4a] hover:underline">
                    <MessageCircle className="size-3.5" /> {lead.phone}
                  </a>
                )}
                {lead.email && <span>{lead.email}</span>}
              </p>
              {lead.message && <p className="mt-1 text-sm">“{lead.message}”</p>}
            </div>
            <div className="text-sm">
              {vehicle ? (
                <Link href={`/torque/estoque/${vehicle.id}`} className="font-medium hover:underline">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </Link>
              ) : (
                <span className="text-[#6b6b76]">Sem veículo</span>
              )}
              <p className="text-[#6b6b76]">Vendedor: {seller?.name ?? "não atribuído"}</p>
            </div>
            <form action={updateLead} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <select name="status" defaultValue={lead.status} className={SELECT}>
                {leadStatus.enumValues.map((v) => (
                  <option key={v} value={v}>
                    {LEAD_STATUS[v]}
                  </option>
                ))}
              </select>
              {manager && (
                <select name="sellerId" defaultValue={lead.sellerId ?? ""} className={SELECT}>
                  <option value="">Sem vendedor</option>
                  {sellers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
              <button className="h-10 rounded-lg bg-[#2a2a33] px-4 text-sm font-semibold text-white">Salvar</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
