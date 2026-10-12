"use client";

import { Camera, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { useRef, useState } from "react";

import { VehiclePhoto } from "@/components/car-image";
import type { Vehicle } from "@/db/schema";
import { cn } from "@/lib/utils";

import { FavoriteButton } from "./favorite-button";
import { Lightbox } from "./lightbox";
import { BackButton, ShareButton } from "./share-button";

/**
 * Galeria da página do veículo.
 * Celular: carrossel de ponta a ponta (desliza com o dedo, toque abre a tela cheia).
 * Computador: mosaico no padrão dos portais; qualquer foto abre a tela cheia.
 */
export function VehicleGallery({ vehicle: v, title }: { vehicle: Vehicle; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const total = Math.max(1, v.photos.length);
  const tiles = v.photos.slice(1, total >= 5 ? 5 : 3);
  const extra = total - 1 - tiles.length;

  const scrollTo = (n: number) => track.current?.scrollTo({ left: n * track.current.clientWidth, behavior: "smooth" });
  const badge = v.hasHistoryReport && <span className="absolute left-3 top-3 rounded-full bg-[#1c9b4a] px-2.5 py-1 text-xs font-bold text-white sm:left-4 sm:top-4">Histórico Veicular</span>;
  const tileBtn = "group relative block size-full overflow-hidden focus-visible:outline-2 focus-visible:outline-primary";

  return (
    <>
      {/* Celular */}
      <div data-tour="pdp-galeria" className="relative -mx-4 sm:hidden">
        <div
          ref={track}
          onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
        >
          {Array.from({ length: total }, (_, n) => (
            <button key={n} type="button" onClick={() => setOpen(n)} aria-label={`Abrir foto ${n + 1} em tela cheia`} className="w-full shrink-0 snap-center">
              <VehiclePhoto vehicle={v} index={n} className="aspect-[4/3.2] w-full" />
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/35 to-transparent p-2 text-white">
          <span className="pointer-events-auto rounded-full bg-white/90 text-[#1f1f28]">
            <BackButton />
          </span>
          <span className="pointer-events-auto flex gap-2">
            <span className="grid size-10 place-items-center rounded-full bg-white/90">
              <FavoriteButton id={v.id} plain className="size-10 [&_svg]:size-5" />
            </span>
            <span className="rounded-full bg-white/90 text-[#1f1f28] [&_svg]:size-5">
              <ShareButton title={title} />
            </span>
          </span>
        </div>
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/65 px-2 py-1 text-xs font-semibold text-white">
          <Camera className="size-3.5" /> {i + 1}/{total}
        </span>
        {total > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {Array.from({ length: Math.min(total, 8) }, (_, n) => (
              <span key={n} className={cn("h-1.5 rounded-full bg-white/70 transition-all", n === Math.min(i, 7) ? "w-4 bg-white" : "w-1.5")} />
            ))}
          </div>
        )}
        {v.hasHistoryReport && <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[#1c9b4a] px-2.5 py-1 text-xs font-bold text-white">Histórico Veicular</span>}
      </div>

      {/* Computador */}
      <div
        data-tour="pdp-galeria"
        className={cn(
          "relative hidden h-[460px] gap-1.5 overflow-hidden rounded-xl sm:grid lg:h-[580px]",
          tiles.length === 0 && "grid-cols-1",
          (tiles.length === 1 || tiles.length === 2) && "grid-cols-[2fr_1fr]",
          tiles.length === 4 && "grid-cols-[2fr_1fr_1fr]",
          tiles.length > 1 && "grid-rows-2",
        )}
      >
        <div className={cn("relative", tiles.length > 1 && "row-span-2")}>
          <button type="button" onClick={() => setOpen(0)} aria-label="Abrir fotos em tela cheia" className={cn(tileBtn, "cursor-zoom-in")}>
            <VehiclePhoto vehicle={v} index={0} className="size-full aspect-auto transition duration-300 group-hover:scale-[1.02]" />
          </button>
          {badge}
          {total > 1 && (
            <>
              <button type="button" onClick={() => setOpen(total - 1)} aria-label="Foto anterior" className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow hover:bg-white">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" onClick={() => setOpen(1)} aria-label="Próxima foto" className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow hover:bg-white">
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
        {tiles.map((_, k) => {
          const n = k + 1;
          const last = k === tiles.length - 1 && extra > 0;
          return (
            <button key={n} type="button" onClick={() => setOpen(n)} aria-label={`Abrir foto ${n + 1}`} className={cn(tileBtn, "cursor-zoom-in")}>
              <VehiclePhoto vehicle={v} index={n} className="size-full aspect-auto transition duration-300 group-hover:scale-[1.04]" />
              {last && <span className="absolute inset-0 grid place-items-center bg-black/45 text-2xl font-semibold text-white">+{extra}</span>}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-4 right-4 flex h-10 items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-semibold text-[#1f1f28] shadow hover:bg-white"
        >
          <Expand className="size-4" /> {total > 1 ? `Ver as ${total} fotos` : "Ampliar foto"}
        </button>
      </div>

      {open !== null && (
        <Lightbox
          vehicle={v}
          start={open}
          title={title}
          onClose={() => {
            if (open !== null) scrollTo(open);
            setOpen(null);
          }}
        />
      )}
    </>
  );
}
