import { CarFront, ChevronDown, Tag } from "lucide-react";

/** Card de busca rápida do celular: tipo, marca e faixa de preço, como nos apps de classificados. */
export function QuickSearch({ brands }: { brands: string[] }) {
  const select = "h-12 w-full appearance-none rounded-xl border border-[#2e2e38] bg-white pl-11 pr-10 text-[15px] text-[#1f1f28] outline-none";
  return (
    <form action="/estoque" className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_14px_rgba(0,0,0,.1)] md:hidden">
      <label className="relative">
        <CarFront className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2" />
        <select name="tipo" defaultValue="" className={select} aria-label="Tipo de veículo">
          <option value="">Carros, vans e utilitários</option>
          <option value="motos">Motos</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2" />
      </label>
      <label className="relative">
        <Tag className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2" />
        <select name="marca" defaultValue="" className={select} aria-label="Marca">
          <option value="">Todas as marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2" />
      </label>
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#cfcfd6]">
        <label className="flex h-12 items-center gap-2 border-r border-[#cfcfd6] px-4">
          <span className="text-sm font-bold">De</span>
          <input name="precoMin" inputMode="numeric" placeholder="R$ 10.000" className="min-w-0 flex-1 text-[15px] outline-none placeholder:text-[#9a9aa5]" />
        </label>
        <label className="flex h-12 items-center gap-2 px-4">
          <span className="text-sm font-bold">Até</span>
          <input name="precoMax" inputMode="numeric" placeholder="R$ 150.000" className="min-w-0 flex-1 text-[15px] outline-none placeholder:text-[#9a9aa5]" />
        </label>
      </div>
      <button className="h-12 rounded-full bg-primary text-[15px] font-bold text-white active:scale-[.98]">Buscar</button>
    </form>
  );
}
