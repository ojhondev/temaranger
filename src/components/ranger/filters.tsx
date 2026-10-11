"use client";

import { Bike, CarFront, ChevronUp, Info, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import type { StockFilters } from "@/db/queries";
import { cn } from "@/lib/utils";

type Brand = { name: string; logo: string | null };

const LABELS: Partial<Record<keyof StockFilters, (v: string) => string>> = {
  cidade: (v) => v,
  marca: (v) => v,
  modelo: (v) => v,
  carroceria: (v) => v,
  cambio: (v) => v,
  anoMin: (v) => `A partir de ${v}`,
  anoMax: (v) => `Até ${v}`,
  precoMin: (v) => `A partir de R$ ${Number(v).toLocaleString("pt-BR")}`,
  precoMax: (v) => `Até R$ ${Number(v).toLocaleString("pt-BR")}`,
  kmMax: (v) => `Até ${Number(v).toLocaleString("pt-BR")} km`,
  q: (v) => `“${v}”`,
  tipo: (v) => (v === "motos" ? "Motos" : "Carros"),
};

/** Painel de filtros do tema Ranger (lateral no desktop, gaveta no celular). */
export function Filters({
  filters,
  brands,
  transmissions,
  bodies,
  onClose,
}: {
  filters: StockFilters;
  brands: Brand[];
  transmissions: string[];
  bodies: string[];
  onClose?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [brandQuery, setBrandQuery] = useState("");
  const [city, setCity] = useState(filters.cidade ?? "");

  function apply(patch: Partial<StockFilters>) {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries({ ...filters, ...patch })) if (v) next[k] = String(v);
    router.push(`${pathname}?${new URLSearchParams(next).toString()}`, { scroll: false });
  }

  const applied = (Object.keys(LABELS) as (keyof StockFilters)[]).filter((k) => filters[k] && k !== "tipo");
  const visibleBrands = brands.filter((b) => b.name.toLowerCase().includes(brandQuery.trim().toLowerCase()));
  const isMoto = filters.tipo === "motos";

  const onEnter = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div className="flex flex-col rounded-[22px] border border-[#e2e2e8] bg-white">
      {/* Filtros aplicados */}
      <div className="border-b border-[#e2e2e8] px-6 py-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-3 text-lg font-semibold text-[#1f1f1f]">
            Filtros aplicados
            <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">
              {applied.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setOpen(!open)} aria-label="Recolher filtros aplicados" className="grid size-8 place-items-center">
              <ChevronUp className={cn("size-5 transition", !open && "rotate-180")} />
            </button>
            {onClose && (
              <button type="button" onClick={onClose} aria-label="Fechar filtros" className="grid size-8 place-items-center lg:hidden">
                <X className="size-5" />
              </button>
            )}
          </div>
        </div>
        {open && (
          <>
            <button
              type="button"
              onClick={() => router.push(`${pathname}${isMoto ? "?tipo=motos" : ""}`, { scroll: false })}
              className="mt-3 text-[15px] font-semibold text-[#4a4a55] underline underline-offset-4"
            >
              Limpar todos
            </button>
            {applied.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {applied.map((k) => (
                  <span key={k} className="flex h-12 items-center gap-3 rounded-full border border-[#cfcfd6] pl-4 pr-3 text-[15px] font-semibold text-[#3d3d47]">
                    {LABELS[k]!(filters[k]!)}
                    <button type="button" onClick={() => apply({ [k]: undefined })} aria-label={`Remover ${k}`}>
                      <X className="size-4 text-[#6b6b76]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-0 px-6">
        {/* Carros / Motos */}
        <div className="grid grid-cols-2 rounded-full bg-ranger-lavender p-1.5 mt-6">
          {[
            { label: "Carros", value: undefined, icon: CarFront },
            { label: "Motos", value: "motos", icon: Bike },
          ].map(({ label, value, icon: Icon }) => {
            const active = (value === "motos") === isMoto;
            return (
              <button
                key={label}
                type="button"
                onClick={() => router.push(`${pathname}${value ? "?tipo=motos" : ""}`, { scroll: false })}
                className={cn(
                  "flex h-[52px] items-center justify-center gap-2 rounded-full text-base font-semibold transition",
                  active ? "bg-white text-[#1f1f1f] shadow-sm" : "text-[#9a9aa5] hover:text-[#4a4a55]",
                )}
              >
                <Icon className="size-5" /> {label}
              </button>
            );
          })}
        </div>

        {/* Localização */}
        <section className="border-b border-[#e2e2e8] py-6">
          <h3 className="font-heading text-2xl font-semibold text-[#1f1f1f]">Localização</h3>
          <div className="relative mt-4 rounded-lg border border-[#1f1f1f] px-3 pb-1.5 pt-5">
            <label htmlFor="f-cidade" className="absolute left-3 top-1.5 text-[11px] text-[#6b6b76]">
              Digite sua cidade ou estado
            </label>
            <input
              id="f-cidade"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onBlur={() => city !== (filters.cidade ?? "") && apply({ cidade: city })}
              onKeyDown={onEnter(() => apply({ cidade: city }))}
              className="w-full pr-8 text-[17px] text-[#1f1f1f] outline-none"
            />
            {city && (
              <button
                type="button"
                aria-label="Limpar localização"
                onClick={() => {
                  setCity("");
                  apply({ cidade: undefined });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </section>

        {/* Marca */}
        {brands.length > 0 && (
          <section className="border-b border-[#e2e2e8] py-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-2xl font-semibold text-[#1f1f1f]">Marca</h3>
              <Info className="size-5 text-[#3d3d47]" aria-label="Marcas com veículos no estoque" />
            </div>
            <div className="mt-4 flex h-[52px] items-center gap-3 rounded-full border border-[#cfcfd6] px-5">
              <Search className="size-5 text-[#4a4a55]" />
              <input
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Buscar por marca"
                className="min-w-0 flex-1 text-[15px] outline-none placeholder:text-[#6b6b76]"
              />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-y-5">
              {visibleBrands.map((b) => {
                const active = filters.marca?.toLowerCase() === b.name.toLowerCase();
                return (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => apply({ marca: active ? undefined : b.name, modelo: undefined })}
                    className="flex flex-col items-center gap-2"
                  >
                    <span
                      className={cn(
                        "grid size-[88px] place-items-center overflow-hidden rounded-full border-2 bg-white p-4 transition",
                        active ? "border-primary ring-2 ring-primary/25" : "border-[#e2e2e8] hover:border-[#a8a8b3]",
                      )}
                    >
                      {b.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.logo} alt="" className="size-full object-contain" />
                      ) : (
                        <span className="font-heading text-sm font-bold">{b.name.slice(0, 3)}</span>
                      )}
                    </span>
                    <span className={cn("text-[15px] font-semibold", active ? "text-primary" : "text-[#1f1f1f]")}>{b.name}</span>
                  </button>
                );
              })}
              {visibleBrands.length === 0 && <p className="col-span-3 text-sm text-muted-foreground">Nenhuma marca encontrada.</p>}
            </div>
          </section>
        )}

        <RangeSection
          title="Ano"
          min={{ key: "anoMin", placeholder: "Ano mínimo", value: filters.anoMin }}
          max={{ key: "anoMax", placeholder: "Ano máximo", value: filters.anoMax }}
          apply={apply}
        />
        <RangeSection
          title="Preço"
          min={{ key: "precoMin", placeholder: "Preço mínimo", value: filters.precoMin }}
          max={{ key: "precoMax", placeholder: "Preço máximo", value: filters.precoMax }}
          apply={apply}
        />
        <RangeSection
          title="Quilometragem"
          max={{ key: "kmMax", placeholder: "Km máximo", value: filters.kmMax }}
          apply={apply}
        />

        {transmissions.length > 0 && (
          <ChipSection title="Câmbio" options={transmissions} value={filters.cambio} onPick={(v) => apply({ cambio: v })} />
        )}
        {!isMoto && bodies.length > 0 && (
          <ChipSection title="Carroceria" options={bodies} value={filters.carroceria} onPick={(v) => apply({ carroceria: v })} last />
        )}
      </div>
    </div>
  );
}

type RangeField = { key: keyof StockFilters; placeholder: string; value?: string };

function RangeSection({
  title,
  min,
  max,
  apply,
}: {
  title: string;
  min?: RangeField;
  max: RangeField;
  apply: (p: Partial<StockFilters>) => void;
}) {
  return (
    <section className="border-b border-[#e2e2e8] py-6">
      <h3 className="font-heading text-2xl font-semibold text-[#1f1f1f]">{title}</h3>
      <p className="mt-4 text-[15px] font-bold text-[#1f1f1f]">{min ? "Escolher um intervalo" : "Escolher um limite"}</p>
      <div className="mt-3 grid grid-cols-2 gap-5">
        {[min, max].filter(Boolean).map((f) => (
          <input
            key={f!.key}
            inputMode="numeric"
            defaultValue={f!.value}
            placeholder={f!.placeholder}
            aria-label={f!.placeholder}
            onBlur={(e) => {
              const v = e.target.value.replace(/\D/g, "");
              if (v !== (f!.value ?? "")) apply({ [f!.key]: v || undefined });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="h-14 w-full rounded-lg border border-[#cfcfd6] px-3 text-[17px] outline-none placeholder:text-[#6b6b76] focus:border-[#1f1f1f]"
          />
        ))}
      </div>
    </section>
  );
}

function ChipSection({
  title,
  options,
  value,
  onPick,
  last,
}: {
  title: string;
  options: string[];
  value?: string;
  onPick: (v: string | undefined) => void;
  last?: boolean;
}) {
  return (
    <section className={cn("py-6", !last && "border-b border-[#e2e2e8]")}>
      <h3 className="font-heading text-2xl font-semibold text-[#1f1f1f]">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onPick(value === o ? undefined : o)}
            className={cn(
              "h-10 rounded-full border px-4 text-sm font-semibold transition",
              value === o ? "border-ranger-ink bg-ranger-ink text-white" : "border-[#cfcfd6] text-[#3d3d47] hover:border-[#a8a8b3]",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </section>
  );
}
