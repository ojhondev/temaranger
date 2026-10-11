import { FiltersShell } from "@/components/ranger/filters-shell";
import { HeaderHome } from "@/components/ranger/header-home";
import { SortSelect } from "@/components/ranger/sort-select";
import { VehicleCard } from "@/components/site/vehicle-card";
import { BODY_TYPES } from "@/config/ranger";
import { getFacets, listBrands, listPublicVehicles, type StockFilters } from "@/db/queries";
import { POPULAR_BRANDS, brandLogo } from "@/lib/brands";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Carros seminovos à venda" };

const FILTER_KEYS: (keyof StockFilters)[] = [
  "q", "cidade", "marca", "modelo", "carroceria", "cambio", "loja", "anoMin", "anoMax", "precoMin", "precoMax", "kmMax",
];

export default async function Estoque({ searchParams }: { searchParams: Promise<StockFilters> }) {
  const f = await searchParams;
  const tenant = await getTenant();
  const [rows, inStock, facets] = await Promise.all([
    listPublicVehicles(tenant.id, f, 120),
    listBrands(tenant.id, f.tipo === "motos" ? "moto" : "car"),
    getFacets(tenant.id),
  ]);

  // Marcas populares primeiro, depois as demais que existem no estoque.
  const names = [...POPULAR_BRANDS.filter((b) => inStock.includes(b)), ...inStock.filter((b) => !POPULAR_BRANDS.includes(b))];
  const brands = names.map((name) => ({ name, logo: brandLogo(name) }));
  const bodies = BODY_TYPES.filter((b) => facets.bodies[b]);
  const appliedCount = FILTER_KEYS.filter((k) => f[k]).length;
  const what = f.tipo === "motos" ? "Motos" : "Carros";

  return (
    <>
      <HeaderHome tenant={tenant} q={f.q} />
      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-10 pt-4 lg:grid-cols-[400px_1fr] lg:gap-10 lg:px-[3%]">
        <FiltersShell
          filters={f}
          brands={brands}
          transmissions={facets.transmissions}
          bodies={bodies}
          appliedCount={appliedCount}
        />

        <section className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e2e2e8] pb-4">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-[#1f1f1f]">
                {what} {f.marca ? `${f.marca} ` : ""}
                {f.modelo ? `${f.modelo} ` : ""}à venda{f.cidade ? ` em ${f.cidade}` : ""}
              </h1>
              <p className="mt-1 text-sm text-[#6b6b76]">
                {rows.length} {rows.length === 1 ? "anúncio encontrado" : "anúncios encontrados"}
              </p>
            </div>
            <SortSelect value={f.ordem} />
          </div>

          {rows.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-heading text-lg font-semibold">Nenhum anúncio com esses filtros</p>
              <p className="mt-1 text-sm text-muted-foreground">Tente remover algum filtro ou ampliar a faixa de preço.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 2xl:grid-cols-4">
              {rows.map((r) => (
                <VehicleCard key={r.vehicle.id} {...r} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
