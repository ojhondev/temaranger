"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Trilho horizontal com scroll-snap, setas laterais e indicador de páginas.
 * Os filhos definem a própria largura (ex.: `w-[200px] shrink-0`).
 */
export function Rail({
  children,
  dots,
  arrows = "right",
  className,
}: {
  children: React.ReactNode;
  dots?: boolean;
  arrows?: "right" | "both" | "left" | "none";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const total = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05));
    setPages(total);
    setPage(Math.round(el.scrollLeft / el.clientWidth));
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const go = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });

  const btn =
    "absolute top-[38%] z-10 hidden size-9 sm:grid -translate-y-1/2 place-items-center rounded-full border border-[#cfcfd6] bg-white text-[#1f1f1f] shadow-sm transition hover:shadow-md disabled:pointer-events-none disabled:opacity-0";

  return (
    <div className={cn("relative", className)}>
      {(arrows === "both" || arrows === "left") && (
        <button type="button" aria-label="Anterior" onClick={() => go(-1)} disabled={edge.start} className={cn(btn, "-left-4")}>
          <ChevronLeft className="size-5" />
        </button>
      )}
      <div ref={ref} onScroll={measure} className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth">
        {children}
      </div>
      {(arrows === "both" || arrows === "right") && (
        <button type="button" aria-label="Próximo" onClick={() => go(1)} disabled={edge.end} className={cn(btn, "-right-4")}>
          <ChevronRight className="size-5" />
        </button>
      )}
      {dots && pages > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Página ${i + 1}`}
              onClick={() => ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: "smooth" })}
              className={cn("h-1 w-6 rounded-full transition", i === page ? "bg-primary" : "bg-[#dcdce3]")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
