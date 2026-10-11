import Link from "next/link";
import { MapPin } from "lucide-react";

import { CarImage } from "@/components/car-image";
import type { Store, Vehicle } from "@/db/schema";
import { brl, km } from "@/lib/format";

export function VehicleCard({ vehicle: v, store }: { vehicle: Vehicle; store: Store }) {
  const belowFipe = v.fipePrice && v.price < v.fipePrice;
  return (
    <Link
      href={`/veiculo/${v.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative">
        <CarImage color={v.color} body={v.bodyType} />
        {v.status === "reserved" && (
          <span className="absolute left-3 top-3 rounded-md bg-amber-500 px-2 py-1 text-xs font-bold text-white">
            Reservado
          </span>
        )}
        {belowFipe && v.status === "available" && (
          <span className="absolute left-3 top-3 rounded-md bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
            Abaixo da FIPE
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-heading text-lg font-bold leading-tight">
          {v.brand} {v.model}
        </p>
        <p className="line-clamp-1 text-sm text-muted-foreground">{v.version}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {v.year} · {km(v.km)} · {v.transmission}
        </p>
        <p className="mt-auto pt-3 font-heading text-2xl font-extrabold text-primary">{brl(v.price)}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" /> {store.city}
        </p>
      </div>
    </Link>
  );
}
