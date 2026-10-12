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
import { VehiclePhoto } from "@/components/car-image";
import { marketplaceAccounts, vehicleStatus, type Listing, type Store, type Vehicle } from "@/db/schema";
import { isManager, requireSession } from "@/lib/auth";
import { MARKETPLACES, VEHICLE_STATUS, brl, daysSince, km } from "@/lib/format";
import { ALL_MARKETPLACES } from "@/lib/marketplaces";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

const LISTING_LABEL = { published: "Publicado", paused: "Pausado (reservado)", removed: "Fora do ar", error: "Erro" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string; erro?: string }> };

export default async function EditarVeiculo({ params, searchParams }: Props) {
  const session = await requireSession();
  const tenant = await getTenant();
  const data = await getAdminVehicle(tenant.id, Number((await params).id));
  if (!data) notFound();
  if (!isManager(session)) {
    const store = (await listStores(tenant.id)).find((st) => st.id === data.vehicle.storeId);
    return <SellerView vehicle={data.vehicle} listings={data.listings} store={store} />;
  }
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

/** Vendedor: consulta o carro para atender o cliente, sem editar. */
function SellerView({ vehicle: v, listings, store }: { vehicle: Vehicle; listings: Listing[]; store?: Store }) {
  const specs: [string, string | null | undefined][] = [
    ["Preço", brl(v.price)],
    ["FIPE", v.fipePrice ? brl(v.fipePrice) : null],
    ["Ano", v.yearModel ? `${v.year}/${v.yearModel}` : String(v.year)],
    ["Km", km(v.km)],
    ["Câmbio", v.transmission],
    ["Combustível", v.fuel],
    ["Cor", v.color],
    ["Placa", v.plate],
    ["Loja", store?.name],
    ["Aceita troca", v.acceptsTrade ? "Sim" : "Não"],
  ];
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
        {v.version && <span className="text-sm text-[#6b6b76]">{v.version}</span>}
        {v.status !== "sold" && (
          <a href={`/veiculo/${v.slug}`} target="_blank" className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Ver no site <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Panel className="p-3">
          <div className="overflow-hidden rounded-lg">
            <VehiclePhoto vehicle={v} />
          </div>
          {v.photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {v.photos.slice(1).map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
              ))}
            </div>
          )}
        </Panel>
        <div className="flex min-w-0 flex-col gap-5">
          <Panel>
            <h2 className="mb-3 text-base font-semibold">Ficha</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {specs
                .filter(([, val]) => val)
                .map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-xs text-[#6b6b76]">{label}</dt>
                    <dd className="font-medium">{val}</dd>
                  </div>
                ))}
            </dl>
          </Panel>
          <Panel>
            <h2 className="mb-1 text-base font-semibold">Anúncios nos portais</h2>
            <div className="flex flex-col divide-y text-sm">
              {ALL_MARKETPLACES.map((mp) => {
                const l = listings.find((x) => x.marketplace === mp);
                return (
                  <p key={mp} className="flex justify-between gap-3 py-2.5">
                    <span className="font-medium">{MARKETPLACES[mp]}</span>
                    <span className="text-[#6b6b76]">{l?.enabled ? LISTING_LABEL[l.status] : "Fora do ar"}</span>
                  </p>
                );
              })}
            </div>
          </Panel>
          <p className="text-xs text-[#6b6b76]">Preço, fotos e status são alterados pelo gestor da loja.</p>
        </div>
      </div>
      {(v.description || v.optionals.length > 0) && (
        <Panel>
          {v.description && <p className="whitespace-pre-line text-sm">{v.description}</p>}
          {v.optionals.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {v.optionals.map((o) => (
                <li key={o} className="rounded-full bg-[#f3f3f6] px-3 py-1 text-xs [overflow-wrap:anywhere]">
                  {o}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
