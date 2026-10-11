import { VehiclePhoto } from "@/components/car-image";
import type { Vehicle } from "@/db/schema";

/** Mosaico da PDP: 1 foto grande + 4 menores, com "+N" na última. */
export function PdpGallery({ vehicle: v }: { vehicle: Vehicle }) {
  const extra = Math.max(0, v.photos.length - 5);
  const tile = "size-full aspect-auto";
  return (
    <div className="grid h-[300px] grid-cols-1 gap-1.5 overflow-hidden sm:h-[460px] sm:grid-cols-[2fr_1fr_1fr] sm:grid-rows-2 lg:h-[604px]">
      <div className="relative sm:row-span-2">
        <VehiclePhoto vehicle={v} index={0} className={tile} />
        {v.hasHistoryReport && (
          <span className="absolute left-4 top-4 rounded-full bg-[#1c9b4a] px-2.5 py-1 text-xs font-bold text-white">
            Histórico Veicular
          </span>
        )}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative hidden sm:block">
          <VehiclePhoto vehicle={v} index={i} className={tile} />
          {i === 4 && extra > 0 && (
            <span className="absolute inset-0 grid place-items-center bg-black/35 text-2xl font-semibold text-white">+{extra}</span>
          )}
        </div>
      ))}
    </div>
  );
}
