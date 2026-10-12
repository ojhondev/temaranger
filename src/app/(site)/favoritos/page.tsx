import Link from "next/link";
import { Heart } from "lucide-react";

import { HeaderHome } from "@/components/ranger/header-home";
import { VehicleCard } from "@/components/site/vehicle-card";
import { listVehiclesByIds } from "@/db/queries";
import { getTenant } from "@/lib/tenant";

import { FavoritesSync } from "./sync";

export const metadata = { title: "Favoritos", robots: { index: false } };

export default async function Favoritos({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const tenant = await getTenant();
  const { ids } = await searchParams;
  const list = (ids ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  const rows = await listVehiclesByIds(tenant.id, list);

  return (
    <>
      <HeaderHome tenant={tenant} />
      <FavoritesSync current={ids ?? "__"} />
      <main className="px-4 pb-10 pt-4 sm:px-6 lg:px-10 2xl:px-14">
        <h1 className="font-heading text-2xl font-bold text-[#1f1f28]">Favoritos</h1>
        <p className="mt-1 text-sm text-[#6b6b76]">Salvos neste aparelho. Toque no coração de um anúncio para guardar aqui.</p>
        {ids === undefined ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-[#f2f2f4]" />
            ))}
          </div>
        ) : rows.length ? (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {rows.map((r) => (
              <VehicleCard key={r.vehicle.id} {...r} />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl bg-[#f5f6f7] px-6 py-14 text-center">
            <Heart className="size-10 text-primary" />
            <p className="font-heading text-lg font-semibold">Nenhum favorito ainda</p>
            <p className="max-w-sm text-sm text-[#6b6b76]">Explore o estoque e toque no coração dos carros que você gostou.</p>
            <Link href="/estoque" className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">
              Ver estoque
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
