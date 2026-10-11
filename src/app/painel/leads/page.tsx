import Link from "next/link";
import { Zap } from "lucide-react";

import { simulatePortalLead, updateLead } from "@/app/painel/actions";
import { LeadStatusBadge } from "@/components/painel/status-badge";
import { Button } from "@/components/ui/button";
import { listLeads, listSellers, type LeadFilters } from "@/db/queries";
import { leadChannel, leadStatus } from "@/db/schema";
import { CHANNELS, LEAD_STATUS } from "@/lib/format";
import { getTenant } from "@/lib/tenant";

const SELECT = "h-8 rounded-lg border bg-card px-2 text-sm";

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default async function Leads({ searchParams }: { searchParams: Promise<LeadFilters> }) {
  const f = await searchParams;
  const tenant = await getTenant();
  const [rows, sellers] = await Promise.all([listLeads(tenant.id, f), listSellers(tenant.id)]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Leads</h1>
        <form action={simulatePortalLead}>
          <Button type="submit" variant="outline" className="gap-1.5">
            <Zap className="size-4" /> Simular lead de portal (demo)
          </Button>
        </form>
      </div>

      <form className="flex flex-wrap gap-2">
        <select name="status" defaultValue={f.status ?? ""} className={SELECT}>
          <option value="">Todos os status</option>
          {leadStatus.enumValues.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS[s]}
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
        <select name="vendedor" defaultValue={f.vendedor ?? ""} className={SELECT}>
          <option value="">Todos os vendedores</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
        <Link href="/painel/leads" className="self-center text-sm text-muted-foreground hover:underline">
          Limpar
        </Link>
      </form>

      <div className="flex flex-col gap-3">
        {rows.length === 0 && <p className="text-muted-foreground">Nenhum lead.</p>}
        {rows.map(({ lead, vehicle, seller }) => (
          <div key={lead.id} className="grid gap-3 rounded-xl border bg-card p-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{lead.name}</p>
                <LeadStatusBadge status={lead.status} />
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">{CHANNELS[lead.channel]}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {dateFmt.format(lead.createdAt)}
                {lead.phone && (
                  <>
                    {" · "}
                    <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {lead.phone}
                    </a>
                  </>
                )}
              </p>
              {lead.message && <p className="mt-1 text-sm">“{lead.message}”</p>}
            </div>
            <div className="text-sm">
              {vehicle ? (
                <Link href={`/painel/estoque/${vehicle.id}`} className="hover:underline">
                  {vehicle.brand} {vehicle.model} {vehicle.year}
                </Link>
              ) : (
                <span className="text-muted-foreground">Sem veículo</span>
              )}
              <p className="text-muted-foreground">Vendedor: {seller?.name ?? "não atribuído"}</p>
            </div>
            <form action={updateLead} className="flex flex-wrap gap-2">
              <input type="hidden" name="id" value={lead.id} />
              <select name="status" defaultValue={lead.status} className={SELECT}>
                {leadStatus.enumValues.map((s) => (
                  <option key={s} value={s}>
                    {LEAD_STATUS[s]}
                  </option>
                ))}
              </select>
              <select name="sellerId" defaultValue={lead.sellerId ?? ""} className={SELECT}>
                <option value="">Sem vendedor</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm">
                Salvar
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
