"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const KEY = "ranger:favoritos";

function read(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Favoritar no próprio aparelho (sem login). */
export function FavoriteButton({ id, className, plain }: { id: number; className?: string; plain?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(read().includes(id)), [id]);

  function toggle() {
    const list = read();
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    setOn(next.includes(id));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Remover dos favoritos" : "Favoritar"}
      aria-pressed={on}
      className={cn(
        plain ? "grid size-9 place-items-center" : "grid size-8 place-items-center rounded-full bg-white shadow-sm",
        className,
      )}
    >
      <Heart className={cn(plain ? "size-6" : "size-4", on ? "fill-primary text-primary" : "text-[#3d3d47]")} />
    </button>
  );
}
