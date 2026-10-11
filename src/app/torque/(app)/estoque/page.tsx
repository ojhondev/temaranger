import Link from "next/link";
import { Plus } from "lucide-react";

import { VehiclePhoto } from "@/components/car-image";
import { VehicleStatusBadge } from "@/components/torque/status-badge";
import { PageHeader, Saved } from "@/components/torque/ui";
import { listAdminVehicles } from "@/db/queries";
import { isManager, requireSession } from "@/lib/auth";
import { MARKETPLACES, brl, daysSince, km } from "@/lib/format";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

export const metadata = { title: "Estoque" };

export default async function Estoque({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; excluido?: string }> }) {
  const s = await requireSession();
  const tenant = await getTenant();
  const manager = isManager(s);
  const f = await searchParams;
  const all = await listAdminVehicles(tenant.id);
  const q = (f.q ?? "").toLowerCase();
  const rows = all.filter(
    ({ vehicle: v }) =>
      (!f.status || v.status === f.status) && (!q || `${v.brand} ${v.model} ${v.version} ${v.plate}`.toLowerCase().includes(q)),
  );
  const counts = { available: 0, reserved: 0, sold: 0 };
  for (const r of all) counts[r.vehicle.status]++;

  return (
    <div>
      <PageHeader title="Estoque" kicker={`${counts.available} disponíveis · ${counts.reserved} reservados · ${counts.sold} vendidos`}>
        {manager && (
          <Link href="/torque/estoque/novo" data-tour="estoque-novo" className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white">
            <Plus className="size-4" /> Cadastrar veículo
          </Link>
        )}
      </PageHeader>
      <Saved show={!!f.excluido}>Veículo excluído e retirado dos portais.</Saved>

      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={f.q} placeholder="Buscar marca, modelo ou placa" className="h-10 w-72 rounded-lg border border-[#d6d6dc] bg-white px-3 text-sm" />
        <select name="status" defaultValue={f.status ?? ""} className="h-10 rounded-lg border border-[#d6d6dc] bg-white px-3 text-sm">
          <option value="">Todos</option>
          <option value="available">Disponíveis</option>
          <option value="reserved">Reservados</option>
          <option value="sold">Vendidos</option>
        </select>
        <button className="h-10 rounded-lg bg-[#2a2a33] px-5 text-sm font-semibold text-white">Filtrar</button>
      </form>

      <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_3px_rgba(16,16,24,.06)]" data-tour="estoque-tabela">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wide text-[#6b6b76]">
            <tr>
              <th className="px-4 py-3 font-medium">Veículo</th>
              <th className="px-4 py-3 font-medium">Loja</th>
              <th className="px-4 py-3 text-right font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">No estoque</th>
              <th className="px-4 py-3 font-medium">Portais</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ vehicle: v, store, listings }) => {
              const age = daysSince(v.stockedAt);
              return (
                <tr key={v.id} className="border-b last:border-0 hover:bg-[#fafafb]">
                  <td className="px-4 py-3">
                    <Link href={`/torque/estoque/${v.id}`} className="flex items-center gap-3">
                      <span className="w-20 shrink-0 overflow-hidden rounded-md">
                        <VehiclePhoto vehicle={v} />
                      </span>
                      <span>
                        <span className="font-semibold hover:text-primary">
                          {v.brand} {v.model} {v.year}
                        </span>
                        <span className="block text-xs text-[#6b6b76]">
                          {v.version} · {km(v.km)} · {v.photos.length} {v.photos.length === 1 ? "foto" : "fotos"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">{store.name}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{brl(v.price)}</td>
                  <td className="px-4 py-3">
                    <VehicleStatusBadge status={v.status} />
                  </td>
                  <td className={cn("px-4 py-3 text-right tabular-nums", v.status !== "sold" && age > 60 && "font-semibold text-primary")}>
                    {v.status === "sold" ? "—" : `${age} dias`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {listings
                        .filter((l) => l.status !== "removed")
                        .map((l) => (
                          <span
                            key={l.id}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                              l.status === "published" && "bg-[#e7f7ed] text-[#1d6b3d]",
                              l.status === "paused" && "bg-amber-100 text-amber-800",
                              l.status === "error" && "bg-[#fde8e8] text-[#a3242f]",
                            )}
                          >
                            {MARKETPLACES[l.marketplace]}
                          </span>
                        ))}
                      {listings.every((l) => l.status === "removed") && <span className="text-xs text-[#9a9aa5]">Só no site</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#6b6b76]">
                  Nenhum veículo encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
