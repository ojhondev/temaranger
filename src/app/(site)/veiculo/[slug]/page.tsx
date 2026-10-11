import { notFound } from "next/navigation";
import { Flag, Info, MessageCircle, Video } from "lucide-react";

import { FavoriteButton } from "@/components/ranger/favorite-button";
import { HeaderPdp } from "@/components/ranger/header-pdp";
import { PdpGallery } from "@/components/ranger/pdp-gallery";
import { PdpLeadCard } from "@/components/ranger/pdp-lead-card";
import { Rail } from "@/components/ranger/rail";
import { VehicleCard } from "@/components/site/vehicle-card";
import { BODY_LABEL } from "@/config/ranger";
import { getPublicVehicle, listSimilar } from "@/db/queries";
import { brl, km } from "@/lib/format";
import { getTenant } from "@/lib/tenant";

import { startWhatsapp } from "../../actions";

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
    title: `${v.brand} ${v.model} ${v.version ?? ""} ${v.year}`.replace(/\s+/g, " "),
    description: `${v.brand} ${v.model} ${v.version ?? ""} ${v.year}, ${km(v.km)}, por ${brl(v.price)} em ${row.store.city}.`,
  };
}

export default async function VehiclePage({ params, searchParams }: Props) {
  const tenant = await getTenant();
  const row = await getPublicVehicle(tenant.id, (await params).slug);
  if (!row || row.vehicle.status === "sold") notFound();
  const { vehicle: v, store } = row;
  const { enviado, erro } = await searchParams;
  const similar = await listSimilar(tenant.id, v);

  const yesNo = (b: boolean) => (b ? "Sim" : "Não");
  const specs: [string, string | number | null][] = [
    ["Ano", v.yearModel && v.yearModel !== v.year ? `${v.year}/${v.yearModel}` : `${v.year}/${v.year}`],
    ["KM", v.km.toLocaleString("pt-BR")],
    ["Câmbio", v.transmission],
    ["Carroceria", v.bodyType ? (BODY_LABEL[v.bodyType] ?? v.bodyType) : null],
    ["Combustível", v.fuel],
    ["Cor", v.color],
    ["Aceita troca", yesNo(v.acceptsTrade)],
    ["Garantia de fábrica", yesNo(v.factoryWarranty)],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": v.type === "moto" ? "Motorcycle" : "Car",
    name: `${v.brand} ${v.model} ${v.version ?? ""}`.trim(),
    brand: { "@type": "Brand", name: v.brand },
    model: v.model,
    vehicleModelDate: String(v.yearModel ?? v.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: v.km, unitCode: "KMT" },
    color: v.color ?? undefined,
    offers: { "@type": "Offer", price: v.price, priceCurrency: "BRL", availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <HeaderPdp tenant={tenant} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:px-[5%]">
        <div className="flex min-w-0 flex-col gap-5">
          <PdpGallery vehicle={v} />

          {/* Preço no celular (o card completo fica no fim da página) */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#cfcfd6] p-4 lg:hidden">
            <p className="font-heading text-2xl font-semibold text-[#2e2e38]">{brl(v.price)}</p>
            <a href="#contato" className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white">
              Enviar mensagem
            </a>
          </div>

          {/* Ficha */}
          <section className="rounded-2xl border border-[#cfcfd6] bg-white">
            <div className="px-6 pb-8 pt-8 sm:px-[68px]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-[#2e2e38] sm:text-[38px]">
                    {v.brand} <span className="text-primary">{v.model}</span>
                  </h1>
                  {v.version && <p className="mt-1 text-[17px] uppercase text-[#6b6b76]">{v.version}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2 rounded-full bg-[#dff3e5] px-6 py-2 text-[15px] font-medium text-[#1c7a3c]">
                    Vendedor responde rápido <Info className="size-4" />
                  </span>
                  <FavoriteButton id={v.id} plain />
                </div>
              </div>

              {v.status === "reserved" && (
                <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  Este veículo está reservado. Envie uma mensagem para entrar na fila de espera.
                </p>
              )}

              <dl className="mt-10 font-heading">
                <div>
                  <dt className="text-[15px] text-[#6b6b76]">Cidade</dt>
                  <dd className="mt-1 text-xl font-semibold text-[#2e2e38]">{store.city}</dd>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
                  {specs.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[15px] text-[#6b6b76]">{label}</dt>
                      <dd className="mt-1 text-xl font-semibold leading-tight text-[#2e2e38]">{value ?? "—"}</dd>
                    </div>
                  ))}
                </div>
              </dl>
            </div>

            <div className="border-t border-[#e2e2e8] px-6 py-10 sm:px-[54px]">
              <p className="text-[15px] text-[#4a4a55]">Sobre os diferenciais do anúncio</p>
              <div className="mt-8 flex flex-wrap items-center justify-between gap-6 sm:pl-8">
                <div className="flex items-center gap-5">
                  <span className="grid h-14 w-11 place-items-center rounded-b-[14px] rounded-t-md bg-[#2e2e38] text-white">
                    <Video className="size-5" />
                  </span>
                  <div className="font-heading">
                    <p className="text-[22px] font-medium text-[#2e2e38]">Videochamada</p>
                    <p className="text-lg text-[#4a4a55]">Agende um horário para ver o carro em vídeo!</p>
                  </div>
                </div>
                <form action={startWhatsapp}>
                  <input type="hidden" name="vehicleId" value={v.id} />
                  <input type="hidden" name="intent" value="video" />
                  <button className="flex h-[60px] items-center gap-2 rounded-md bg-primary px-6 text-[15px] font-bold text-white hover:brightness-95">
                    Agendar videochamada <Video className="size-5" />
                  </button>
                </form>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e2e8] px-6 py-7 sm:px-[54px]">
              <form action={startWhatsapp}>
                <input type="hidden" name="vehicleId" value={v.id} />
                <input type="hidden" name="intent" value="report" />
                <button className="flex items-center gap-3 font-heading text-[15px] text-[#2e2e38] hover:underline">
                  <Flag className="size-6" /> Denunciar anúncio do veículo
                </button>
              </form>
              <form action={startWhatsapp}>
                <input type="hidden" name="vehicleId" value={v.id} />
                <button className="flex items-center gap-2 font-heading text-[15px] font-semibold text-[#1c9b4a] hover:underline">
                  <MessageCircle className="size-5" /> Conversar no WhatsApp
                </button>
              </form>
            </div>
          </section>

          {/* Itens */}
          {v.optionals.length > 0 && (
            <section className="rounded-2xl border border-[#cfcfd6] bg-white px-6 py-10 sm:px-[64px]">
              <p className="font-heading text-[15px] text-[#6b6b76]">Itens de veículo</p>
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 font-heading text-base text-[#2e2e38] [overflow-wrap:anywhere] sm:text-lg md:grid-cols-4">
                {v.optionals.map((o) => (
                  <li key={o} className="leading-tight">
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {v.description && (
            <section className="rounded-2xl border border-[#cfcfd6] bg-white px-6 py-8 sm:px-[64px]">
              <p className="font-heading text-[15px] text-[#6b6b76]">Observações do vendedor</p>
              <p className="mt-4 max-w-3xl leading-relaxed text-[#2e2e38]">{v.description}</p>
            </section>
          )}
        </div>

        <aside id="contato" className="scroll-mt-24 lg:sticky lg:top-[104px] lg:mt-9 lg:self-start">
          <PdpLeadCard vehicleId={v.id} price={v.price} storeName={tenant.name} sent={!!enviado} error={!!erro} />
        </aside>

        {similar.length > 0 && (
          <section className="min-w-0 lg:col-span-2">
            <h2 className="text-base font-bold text-[#1f1f1f]">Veículos parecidos</h2>
            <Rail className="mt-3">
              {similar.map((r) => (
                <VehicleCard key={r.vehicle.id} {...r} className="w-[calc(50%-10px)] shrink-0 snap-start sm:w-[214px]" />
              ))}
            </Rail>
          </section>
        )}
      </main>
    </>
  );
}
