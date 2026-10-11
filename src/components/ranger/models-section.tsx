"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CarImage } from "@/components/car-image";
import { BODY_TYPES } from "@/config/ranger";
import { cn } from "@/lib/utils";

import { BodyIcon } from "./body-icon";
import { Rail } from "./rail";

export type ModelCard = {
  brand: string;
  model: string;
  body: string | null;
  color: string | null;
  photo: string | null;
  logo: string | null;
};

/** "Modelos mais buscados": chips de carroceria + cards de modelo. */
export function ModelsSection({ models }: { models: ModelCard[] }) {
  const available = BODY_TYPES.filter((b) => models.some((m) => m.body === b));
  const [body, setBody] = useState<string>(available[0] ?? "SUV");
  const list = useMemo(() => models.filter((m) => m.body === body), [models, body]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[22px] font-bold text-[#3d3d47]">Modelos mais buscados</h2>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="scrollbar-none flex flex-1 gap-2 overflow-x-auto">
          {BODY_TYPES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBody(b)}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition",
                body === b
                  ? "border-ranger-ink bg-ranger-ink text-white"
                  : "border-[#d6d6dc] bg-white text-[#4a4a55] hover:border-[#a8a8b3]",
              )}
            >
              <BodyIcon className="size-[18px]" />
              {b}
            </button>
          ))}
        </div>
        <Link href={`/estoque?carroceria=${encodeURIComponent(body)}`} className="hidden shrink-0 text-base font-bold text-primary hover:underline md:block">
          Conferir modelos
        </Link>
      </div>

      <Rail dots arrows="none" className="mt-6">
        {list.length === 0 && (
          <p className="py-16 text-sm text-muted-foreground">Nenhum modelo dessa carroceria no estoque agora.</p>
        )}
        {list.map((m) => (
          <Link
            key={`${m.brand}-${m.model}`}
            href={`/estoque?marca=${encodeURIComponent(m.brand)}&modelo=${encodeURIComponent(m.model)}`}
            className="relative h-[240px] w-[198px] shrink-0 snap-start overflow-hidden rounded-xl bg-[#e9eaee]"
          >
            {m.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <CarImage color={m.color} body={m.body} className="absolute inset-0 aspect-auto size-full" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_45%,rgba(0,0,0,.55)_100%)]" />
            {m.logo && (
              <span className="absolute left-3 top-3 grid size-10 place-items-center overflow-hidden rounded-full bg-white p-1.5 shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.logo} alt={m.brand} className="size-full object-contain" />
              </span>
            )}
            <p className="absolute bottom-6 left-6 font-heading text-lg font-semibold leading-tight text-white">
              {m.brand}
              <br />
              {m.model}
            </p>
          </Link>
        ))}
      </Rail>
    </section>
  );
}
