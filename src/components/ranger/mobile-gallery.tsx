"use client";

import { Camera } from "lucide-react";
import { useRef, useState } from "react";

import { VehiclePhoto } from "@/components/car-image";
import type { Vehicle } from "@/db/schema";

/** Galeria do celular: fotos de ponta a ponta, desliza com o dedo, contador "1/5". */
export function MobileGallery({ vehicle: v }: { vehicle: Vehicle }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const total = Math.max(1, v.photos.length);

  return (
    <div data-tour="pdp-galeria" className="relative -mx-4 sm:hidden">
      <div
        ref={ref}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
      >
        {Array.from({ length: total }, (_, n) => (
          <div key={n} className="w-full shrink-0 snap-center">
            <VehiclePhoto vehicle={v} index={n} className="aspect-[4/3.4] w-full" />
          </div>
        ))}
      </div>
      <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white">
        <Camera className="size-3.5" /> {i + 1}/{total}
      </span>
      {v.hasHistoryReport && <span className="absolute left-3 top-3 rounded-full bg-[#1c9b4a] px-2.5 py-1 text-xs font-bold text-white">Histórico Veicular</span>}
    </div>
  );
}
