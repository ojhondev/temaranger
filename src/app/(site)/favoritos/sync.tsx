"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Os favoritos ficam no aparelho: leva os ids para a URL e o servidor monta a lista. */
export function FavoritesSync({ current }: { current: string }) {
  const router = useRouter();
  useEffect(() => {
    let ids = "";
    try {
      ids = (JSON.parse(localStorage.getItem("ranger:favoritos") ?? "[]") as number[]).slice().reverse().join(",");
    } catch {}
    if (ids !== current) router.replace(ids ? `/favoritos?ids=${ids}` : "/favoritos?ids=");
  }, [current, router]);
  return null;
}
