"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Filters } from "./filters";

/** Lateral fixa no desktop; botão + gaveta no celular. */
export function FiltersShell(props: React.ComponentProps<typeof Filters> & { appliedCount: number }) {
  const [open, setOpen] = useState(false);
  const { appliedCount, ...rest } = props;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 items-center gap-2 self-start rounded-full border border-[#cfcfd6] px-5 text-sm font-semibold lg:hidden"
      >
        <SlidersHorizontal className="size-4" /> Filtros
        {appliedCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">{appliedCount}</span>
        )}
      </button>
      <aside
        className={cn(
          "lg:sticky lg:top-[88px] lg:block lg:max-h-[calc(100dvh-104px)] lg:overflow-y-auto lg:rounded-[22px] lg:[scrollbar-width:thin]",
          open ? "fixed inset-0 z-50 block overflow-y-auto bg-black/40 p-3" : "hidden",
        )}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <Filters {...rest} onClose={() => setOpen(false)} />
      </aside>
    </>
  );
}
