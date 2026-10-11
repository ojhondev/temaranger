import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, MessageCircle } from "lucide-react";

import { CarImage } from "@/components/car-image";
import { getPublicVehicle } from "@/db/queries";
import { brl, km } from "@/lib/format";
import { getTenant } from "@/lib/tenant";

import { startWhatsapp, submitInterest } from "../../actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ enviado?: string; erro?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const tenant = await getTenant();
  const row = await getPublicVehicle(tenant.id, (await params).slug);
  if (!row) return {};
  const v = row.vehicle;
  return {
    title: `${v.brand} ${v.model} ${v.year}`,
    description: `${v.brand} ${v.model} ${v.version} ${v.year}, ${km(v.km)}, por ${brl(v.price)}.`,
  };
}

export default async function VehiclePage({ params, searchParams }: Props) {
  const tenant = await getTenant();
  const row = await getPublicVehicle(tenant.id, (await params).slug);
  if (!row || row.vehicle.status === "sold") notFound();
  const { vehicle: v, store } = row;
  const { enviado, erro } = await searchParams;

  const specs = [
    ["Ano", v.year],
    ["Quilometragem", km(v.km)],
    ["Câmbio", v.transmission],
    ["Combustível", v.fuel],
    ["Cor", v.color],
    ["Carroceria", v.bodyType],
  ].filter(([, value]) => value);

  const fipeDiff = v.fipePrice ? v.fipePrice - v.price : 0;

  return (
    <div className="grid gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_400px]">
      <div>
        <CarImage color={v.color} body={v.bodyType} className="rounded-2xl" />
        <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight">
          {v.brand} {v.model}
        </h1>
        <p className="text-lg text-muted-foreground">{v.version}</p>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {specs.map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border bg-card p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {v.description && <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">{v.description}</p>}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border bg-card p-6">
          {v.status === "reserved" && (
            <p className="mb-3 rounded-md bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800">
              Veículo reservado. Fale com a gente para entrar na fila.
            </p>
          )}
          <p className="text-sm text-muted-foreground">Preço</p>
          <p className="font-heading text-4xl font-extrabold text-primary">{brl(v.price)}</p>
          {v.fipePrice && (
            <p className="mt-1 text-sm text-muted-foreground">
              FIPE {brl(v.fipePrice)}
              {fipeDiff > 0 && <span className="font-semibold text-emerald-700"> · {brl(fipeDiff)} abaixo</span>}
            </p>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" /> {store.name} · {store.city}
          </p>

          <form action={startWhatsapp} className="mt-5">
            <input type="hidden" name="vehicleId" value={v.id} />
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 font-semibold text-white hover:bg-emerald-700">
              <MessageCircle className="size-5" /> Chamar no WhatsApp
            </button>
          </form>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          {enviado ? (
            <p className="flex items-start gap-2 font-medium text-emerald-700">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              Recebemos seu contato. Um vendedor vai falar com você em instantes.
            </p>
          ) : (
            <form action={submitInterest} className="flex flex-col gap-3">
              <p className="font-heading text-lg font-bold">Tenho interesse</p>
              <input type="hidden" name="vehicleId" value={v.id} />
              <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <input name="name" required placeholder="Seu nome" className="h-11 rounded-lg border px-3 text-sm" />
              <input
                name="phone"
                required
                inputMode="tel"
                placeholder="WhatsApp com DDD"
                className="h-11 rounded-lg border px-3 text-sm"
              />
              <textarea
                name="message"
                rows={3}
                placeholder="Mensagem (opcional): tenho carro na troca, quero financiar…"
                className="rounded-lg border px-3 py-2 text-sm"
              />
              {erro && <p className="text-sm text-destructive">Confira seu nome e telefone com DDD.</p>}
              <button className="h-11 rounded-lg bg-primary font-semibold text-white hover:opacity-90">
                Enviar
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
