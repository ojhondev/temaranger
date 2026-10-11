import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { setVehicleStatus, toggleListing } from "@/app/painel/actions";
import { VehicleStatusBadge } from "@/components/painel/status-badge";
import { VehicleForm } from "@/components/painel/vehicle-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminVehicle, listStores } from "@/db/queries";
import { vehicleStatus } from "@/db/schema";
import { MARKETPLACES, VEHICLE_STATUS, daysSince } from "@/lib/format";
import { ALL_MARKETPLACES } from "@/lib/marketplaces";
import { getTenant } from "@/lib/tenant";

const LISTING_LABEL = { published: "Publicado", paused: "Pausado", removed: "Fora do ar", error: "Erro" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string; erro?: string }> };

export default async function EditarVeiculo({ params, searchParams }: Props) {
  const tenant = await getTenant();
  const data = await getAdminVehicle(tenant.id, Number((await params).id));
  if (!data) notFound();
  const stores = await listStores(tenant.id);
  const { vehicle: v, listings } = data;
  const { salvo, erro } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/painel/estoque" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="size-4" /> Estoque
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">
          {v.brand} {v.model} {v.year}
        </h1>
        <VehicleStatusBadge status={v.status} />
        <span className="text-sm text-muted-foreground">{daysSince(v.stockedAt)} dias no estoque</span>
        {v.status !== "sold" && (
          <Link href={`/veiculo/${v.slug}`} target="_blank" className="ml-auto inline-flex items-center gap-1 text-sm text-primary">
            Ver no site <ExternalLink className="size-3.5" />
          </Link>
        )}
      </div>
      {salvo && <p className="text-sm font-medium text-emerald-700">Salvo e sincronizado com os portais.</p>}
      {erro && <p className="text-sm text-destructive">Preencha os campos obrigatórios (*).</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {vehicleStatus.enumValues.map((s) => (
              <form key={s} action={setVehicleStatus}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="status" value={s} />
                <Button type="submit" variant={v.status === s ? "default" : "outline"} disabled={v.status === s}>
                  {VEHICLE_STATUS[s]}
                </Button>
              </form>
            ))}
            <p className="w-full pt-2 text-xs text-muted-foreground">
              Reservado pausa os anúncios. Vendido tira o carro do site e de todos os portais.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marketplaces</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y">
            {ALL_MARKETPLACES.map((mp) => {
              const l = listings.find((x) => x.marketplace === mp);
              const enabled = l?.enabled ?? false;
              return (
                <div key={mp} className="flex items-center justify-between gap-4 py-2.5">
                  <div>
                    <p className="font-medium">{MARKETPLACES[mp]}</p>
                    <p className="text-xs text-muted-foreground">
                      {l ? LISTING_LABEL[l.status] : "Fora do ar"}
                      {l?.externalId && l.status !== "removed" && ` · ${l.externalId}`}
                      {l?.lastError && ` · ${l.lastError}`}
                    </p>
                  </div>
                  <form action={toggleListing}>
                    <input type="hidden" name="vehicleId" value={v.id} />
                    <input type="hidden" name="marketplace" value={mp} />
                    <input type="hidden" name="enabled" value={enabled ? "0" : "1"} />
                    <Button type="submit" size="sm" variant={enabled ? "outline" : "default"}>
                      {enabled ? "Desligar" : "Ligar"}
                    </Button>
                  </form>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <VehicleForm vehicle={v} stores={stores} />
    </div>
  );
}
