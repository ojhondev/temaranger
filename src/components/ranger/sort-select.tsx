"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "", label: "Mais relevantes" },
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "menor-km", label: "Menor km" },
  { value: "mais-novos", label: "Ano mais novo" },
];

export function SortSelect({ value }: { value?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm text-[#6b6b76]">
      Ordenar por
      <select
        value={value ?? ""}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value) next.set("ordem", e.target.value);
          else next.delete("ordem");
          router.push(`${pathname}?${next.toString()}`, { scroll: false });
        }}
        className="h-10 rounded-full border border-[#cfcfd6] bg-white px-4 font-semibold text-[#1f1f1f]"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
