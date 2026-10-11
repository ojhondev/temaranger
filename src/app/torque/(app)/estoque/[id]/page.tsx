import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";

import { deleteVehicle, setVehicleStatus, toggleListing } from "@/app/torque/actions/inventory";
import { ConfirmButton } from "@/components/torque/confirm-button";
import { VehicleStatusBadge } from "@/components/torque/status-badge";
import { VehicleForm } from "@/components/torque/vehicle-form";
import { Panel, Saved } from "@/components/torque/ui";
import { db } from "@/db";
import { getAdminVehicle, listStores } from "@/db/queries";
import { marketplaceAccounts, vehicleStatus } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { MARKETPLACES, VEHICLE_STATUS, daysSince } from "@/lib/format";
import { ALL_MARKETPLACES } from "@/lib/marketplaces";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

const LISTING_LABEL = { published: "Publicado", paused: "Pausado (reservado)", removed: "Fora do ar", error: "Erro" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string; erro?: string }> };

export default async function EditarVeiculo({ params, searchParams }: Props) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const data = await getAdminVehicle(tenant.id, Number((await params).id));
  if (!data) notFound();
  const [stores, accounts] = await Promise.all([
    listStores(tenant.id),
    db.select().from(marketplaceAccounts).where(and(eq(marketplaceAccounts.tenantId, tenant.id), eq(marketplaceAccounts.status, "connected"))),
  ]);
  const { vehicle: v, listings } = data;
  const { salvo, erro } = await searchParams;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/torque/estoque" className="inline-flex w-fit items-center gap-1 text-sm text-[#6b6b76] hover:underline">
        <ArrowLeft className="size-4" /> Estoque
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">
          {v.brand} {v.model} {v.year}
        </h1>
        <VehicleStatusBadge status={v.status} />
        <span className="text-sm text-[#6b6b76]">{daysSince(v.stockedAt)} dias no estoque</span>
        {v.status !== "sold" && (
          <a href={`/veiculo/${v.slug}`} target="_blank" className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Ver no site <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      <Saved show={!!salvo}>Veículo salvo e sincronizado com o site e os portais.</Saved>
      {erro && <p className="text-sm font-medium text-primary">Preencha loja, marca, modelo, ano e preço.</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <h2 className="text-base font-semibold">Status</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {vehicleStatus.enumValues.map((st) => (
              <form key={st} action={setVehicleStatus}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="status" value={st} />
                <button
                  disabled={v.status === st}
                  className={cn(
                    "h-10 rounded-lg border px-4 text-sm font-semibold",
                    v.status === st ? "border-[#2a2a33] bg-[#2a2a33] text-white" : "border-[#d6d6dc] hover:bg-[#f5f5f7]",
                  )}
                >
                  {VEHICLE_STATUS[st]}
                </button>
              </form>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#6b6b76]">Reservado pausa os anúncios. Vendido tira o carro do site e de todos os portais.</p>
          <form action={deleteVehicle} className="mt-4 border-t pt-4">
            <input type="hidden" name="id" value={v.id} />
            <ConfirmButton
              message="Excluir este veículo? Ele sai do site e de todos os portais, e não dá para desfazer."
              className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <Trash2 className="size-4" /> Excluir veículo
            </ConfirmButton>
          </form>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Anúncios nos portais</h2>
            <Link href="/torque/marketplaces" className="text-xs font-semibold text-primary">
              Gerenciar portais
            </Link>
          </div>
          <div className="mt-2 flex flex-col divide-y">
            {ALL_MARKETPLACES.map((mp) => {
              const l = listings.find((x) => x.marketplace === mp);
              const connected = accounts.some((a) => a.marketplace === mp);
              const enabled = l?.enabled ?? false;
              return (
                <div key={mp} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{MARKETPLACES[mp]}</p>
                    <p className={cn("text-xs", l?.status === "error" ? "text-primary" : "text-[#6b6b76]")}>
                      {!connected ? "Portal não conectado" : l ? LISTING_LABEL[l.status] : "Fora do ar"}
                      {connected && l?.externalId && l.status !== "removed" && ` · ${l.externalId}`}
                      {l?.lastError && ` · ${l.lastError}`}
                    </p>
                  </div>
                  {connected ? (
                    <form action={toggleListing}>
                      <input type="hidden" name="vehicleId" value={v.id} />
                      <input type="hidden" name="marketplace" value={mp} />
                      <input type="hidden" name="enabled" value={enabled ? "0" : "1"} />
                      <button
                        className={cn(
                          "h-9 rounded-lg px-4 text-sm font-semibold",
                          enabled ? "border border-[#d6d6dc] hover:bg-[#f5f5f7]" : "bg-primary text-white",
                        )}
                      >
                        {enabled ? "Tirar do portal" : "Anunciar"}
                      </button>
                    </form>
                  ) : (
                    <Link href="/torque/marketplaces" className="h-9 rounded-lg border border-[#d6d6dc] px-4 text-sm font-semibold leading-9">
                      Conectar
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <VehicleForm vehicle={v} stores={stores} tenantId={tenant.id} />
    </div>
  );
}
