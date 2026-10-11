import Link from "next/link";

import { VehicleCard } from "@/components/site/vehicle-card";
import { listBrands, listPublicVehicles, listStores, type StockFilters } from "@/db/queries";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Estoque" };

const SELECT = "h-10 w-full rounded-lg border bg-white px-3 text-sm";

export default async function Estoque({ searchParams }: { searchParams: Promise<StockFilters> }) {
  const f = await searchParams;
  const tenant = await getTenant();
  const [rows, brands, stores] = await Promise.all([
    listPublicVehicles(tenant.id, f),
    listBrands(tenant.id),
    listStores(tenant.id),
  ]);
  const year = new Date().getFullYear();

  return (
    <div className="grid gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[260px_1fr]">
      <aside>
        <form className="sticky top-24 flex flex-col gap-4 rounded-xl border bg-card p-5">
          <p className="font-heading text-lg font-bold">Filtrar</p>
          <input name="q" defaultValue={f.q} placeholder="Modelo ou versão" className={SELECT} />
          <select name="marca" defaultValue={f.marca ?? ""} className={SELECT}>
            <option value="">Todas as marcas</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <select name="loja" defaultValue={f.loja ?? ""} className={SELECT}>
            <option value="">Todas as lojas</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select name="precoMax" defaultValue={f.precoMax ?? ""} className={SELECT}>
            <option value="">Preço máximo</option>
            {[60000, 80000, 100000, 130000, 160000, 200000, 250000].map((p) => (
              <option key={p} value={p}>
                Até R$ {p.toLocaleString("pt-BR")}
              </option>
            ))}
          </select>
          <select name="anoMin" defaultValue={f.anoMin ?? ""} className={SELECT}>
            <option value="">Ano mínimo</option>
            {Array.from({ length: 8 }, (_, i) => year - i).map((y) => (
              <option key={y} value={y}>
                A partir de {y}
              </option>
            ))}
          </select>
          <select name="kmMax" defaultValue={f.kmMax ?? ""} className={SELECT}>
            <option value="">Km máximo</option>
            {[20000, 40000, 60000, 80000, 100000].map((k) => (
              <option key={k} value={k}>
                Até {k.toLocaleString("pt-BR")} km
              </option>
            ))}
          </select>
          <select name="ordem" defaultValue={f.ordem ?? ""} className={SELECT}>
            <option value="">Mais recentes</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
            <option value="menor-km">Menor km</option>
          </select>
          <button className="h-10 rounded-lg bg-primary font-semibold text-white hover:opacity-90">Aplicar</button>
          <Link href="/estoque" className="text-center text-sm text-muted-foreground hover:underline">
            Limpar filtros
          </Link>
        </form>
      </aside>

      <section>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">
          {rows.length} {rows.length === 1 ? "veículo" : "veículos"}
        </h1>
        {rows.length === 0 ? (
          <p className="mt-6 text-muted-foreground">Nenhum veículo com esses filtros.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {rows.map((r) => (
              <VehicleCard key={r.vehicle.id} {...r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
