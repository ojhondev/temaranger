import Link from "next/link";

import { VehiclePhoto } from "@/components/car-image";
import { FavoriteButton } from "@/components/ranger/favorite-button";
import type { Store, Vehicle } from "@/db/schema";
import { brl, publishedAt } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Card de anúncio do tema Ranger (carrosséis da home e resultados da busca). */
export function VehicleCard({
  vehicle: v,
  store,
  className,
}: {
  vehicle: Vehicle;
  store: Store;
  className?: string;
}) {
  return (
    <div className={cn("group relative flex flex-col", className)}>
      <Link href={`/veiculo/${v.slug}`} className="relative block overflow-hidden rounded-lg">
        <VehiclePhoto vehicle={v} className="transition duration-300 group-hover:scale-[1.03]" />
        {v.featured && (
          <span className="absolute left-2 top-2 rounded bg-ranger-purple px-1.5 py-1 text-[10px] font-bold leading-none text-white">
            Destaque
          </span>
        )}
        {v.status === "reserved" && (
          <span className="absolute bottom-2 left-2 rounded bg-amber-500 px-1.5 py-1 text-[10px] font-bold leading-none text-white">
            Reservado
          </span>
        )}
      </Link>
      <FavoriteButton id={v.id} className="absolute right-2.5 top-2.5" />
      <Link href={`/veiculo/${v.slug}`} className="mt-3 flex flex-1 flex-col px-0.5">
        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#1f1f1f]">
          {v.brand} {v.model} {v.version} {v.year}
        </p>
        {v.tag && (
          <span className="mt-2 w-fit rounded-full bg-ranger-lilac px-2 py-0.5 text-[10px] font-semibold text-ranger-purple">
            {v.tag}
          </span>
        )}
        <p className="mt-3 text-base font-bold text-[#1f1f1f]">{brl(v.price)}</p>
        <p className="mt-3 flex gap-3 text-[10px] text-[#6b6b76]">
          <span>{publishedAt(v.stockedAt)}</span>
          <span>{store.city}</span>
        </p>
      </Link>
    </div>
  );
}
