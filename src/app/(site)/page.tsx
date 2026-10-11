import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";

import { VehicleCard } from "@/components/site/vehicle-card";
import { buttonVariants } from "@/components/ui/button";
import { listBrands, listPublicVehicles, listStores } from "@/db/queries";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PRICE_OPTIONS = [60000, 80000, 100000, 130000, 160000, 200000];

export default async function Home() {
  const tenant = await getTenant();
  const [latest, brands, stores] = await Promise.all([
    listPublicVehicles(tenant.id, {}, 8),
    listBrands(tenant.id),
    listStores(tenant.id),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-neutral-950 px-4 pb-16 pt-14 text-white sm:px-8 sm:pt-20">
        <div className="pointer-events-none absolute -right-40 -top-40 hidden size-[34rem] sm:block rounded-full bg-primary/25 blur-3xl" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Seminovos multimarcas</p>
        <h1 className="relative mt-3 max-w-3xl font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Seu próximo carro está aqui, revisado e com garantia.
        </h1>

        <form action="/estoque" className="relative mt-10 grid gap-3 rounded-2xl bg-white p-3 text-neutral-900 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <input
            name="q"
            placeholder="Busque por modelo: Compass, Onix…"
            className="h-12 rounded-lg border px-4 text-sm outline-none focus:border-primary"
          />
          <select name="marca" defaultValue="" className="h-12 rounded-lg border bg-white px-3 text-sm">
            <option value="">Todas as marcas</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select name="precoMax" defaultValue="" className="h-12 rounded-lg border bg-white px-3 text-sm">
            <option value="">Qualquer preço</option>
            {PRICE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                Até {p.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
              </option>
            ))}
          </select>
          <button className="h-12 rounded-lg bg-primary px-8 font-semibold text-white hover:opacity-90">
            Buscar
          </button>
        </form>
      </section>

      <section className="px-4 py-14 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-3xl font-extrabold tracking-tight">Chegaram agora</h2>
          <Link href="/estoque" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Ver estoque completo <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {latest.map((r) => (
            <VehicleCard key={r.vehicle.id} {...r} />
          ))}
        </div>
      </section>

      <section id="lojas" className="bg-muted px-4 py-14 sm:px-8">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight">Nossas lojas</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {stores.map((s) => (
            <div key={s.id} className="flex flex-col gap-3 rounded-xl border bg-card p-6">
              <p className="font-heading text-xl font-bold">{s.name}</p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {s.address} · {s.city}
              </p>
              <div className="flex gap-2">
                <Link href={`/estoque?loja=${s.id}`} className={buttonVariants({ variant: "outline" })}>
                  Estoque da loja
                </Link>
                {s.whatsapp && (
                  <a
                    href={`https://wa.me/${s.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants(), "gap-1.5")}
                  >
                    <MessageCircle className="size-4" /> Falar com a loja
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
