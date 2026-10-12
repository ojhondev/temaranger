"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { VehiclePhoto } from "@/components/car-image";
import type { Vehicle } from "@/db/schema";
import { cn } from "@/lib/utils";

const MAX = 4;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

type Zoom = { s: number; x: number; y: number };
const NONE: Zoom = { s: 1, x: 0, y: 0 };

/**
 * Visualizador de fotos em tela cheia: desliza (dedo, setas, teclado), zoom com duplo toque,
 * pinça, roda do mouse ou botões, e arrasta a foto ampliada.
 */
export function Lightbox({ vehicle: v, start, title, onClose }: { vehicle: Vehicle; start: number; title: string; onClose: () => void }) {
  const total = Math.max(1, v.photos.length);
  const [i, setI] = useState(start);
  const [zoom, setZoomState] = useState<Zoom>(NONE);
  const [drag, setDrag] = useState(0);
  const zoomRef = useRef(zoom);
  const stage = useRef<HTMLDivElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ x: number; y: number; tx: number; ty: number; s: number; dist: number; moved: boolean } | null>(null);
  const lastTap = useRef(0);

  const setZoom = useCallback((z: Zoom) => {
    const r = stage.current?.getBoundingClientRect();
    const s = clamp(z.s, 1, MAX);
    const mx = r ? ((s - 1) * r.width) / 2 : 0;
    const my = r ? ((s - 1) * r.height) / 2 : 0;
    const next = s === 1 ? NONE : { s, x: clamp(z.x, -mx, mx), y: clamp(z.y, -my, my) };
    zoomRef.current = next;
    setZoomState(next);
  }, []);

  /** Amplia mantendo parado o ponto (cx, cy) da tela. */
  const zoomAt = useCallback(
    (s: number, cx: number, cy: number) => {
      const r = stage.current!.getBoundingClientRect();
      const px = cx - (r.left + r.width / 2);
      const py = cy - (r.top + r.height / 2);
      const z = zoomRef.current;
      const k = clamp(s, 1, MAX) / z.s;
      setZoom({ s, x: px - (px - z.x) * k, y: py - (py - z.y) * k });
    },
    [setZoom],
  );

  const go = useCallback(
    (k: number) => {
      setI((cur) => (cur + k + total) % total);
      setZoom(NONE);
      setDrag(0);
    },
    [setZoom, total],
  );

  // Teclado e rolagem da página travada enquanto aberto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "+" || e.key === "=") setZoom({ ...zoomRef.current, s: zoomRef.current.s + 0.5 });
      if (e.key === "-") setZoom({ ...zoomRef.current, s: zoomRef.current.s - 0.5 });
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose, setZoom]);

  // Roda do mouse amplia (listener não passivo para impedir a rolagem).
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(zoomRef.current.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  useEffect(() => {
    thumbs.current?.children[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [i]);

  function down(e: React.PointerEvent) {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const z = zoomRef.current;
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      tx: z.x,
      ty: z.y,
      s: z.s,
      dist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      moved: pts.length > 1,
    };
  }

  function move(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && g.dist) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      zoomAt(g.s * (dist / g.dist), (pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
      return;
    }
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
    if (zoomRef.current.s > 1) setZoom({ s: zoomRef.current.s, x: g.tx + dx, y: g.ty + dy });
    else if (total > 1) setDrag(dx);
  }

  function up(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size > 0 || !g) return;
    gesture.current = null;
    if (zoomRef.current.s === 1 && Math.abs(drag) > 60) {
      go(drag < 0 ? 1 : -1);
      return;
    }
    setDrag(0);
    if (g.moved) return;
    // Toque/clique sem arrastar: mouse amplia no clique; no toque, duplo toque.
    const now = Date.now();
    const isDouble = now - lastTap.current < 300;
    lastTap.current = now;
    if (e.pointerType === "mouse" || isDouble) {
      if (zoomRef.current.s > 1) setZoom(NONE);
      else zoomAt(2.5, e.clientX, e.clientY);
      lastTap.current = 0;
    }
  }

  const btn = "grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95";
  const zoomed = zoom.s > 1;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col bg-[#0b0b0f] text-white" role="dialog" aria-modal aria-label={`Fotos: ${title}`}>
      <div className="flex h-14 shrink-0 items-center gap-3 px-3 sm:px-5">
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tabular-nums">
          {i + 1} / {total}
        </span>
        <p className="hidden min-w-0 flex-1 truncate text-sm text-white/80 sm:block">{title}</p>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setZoom({ ...zoomRef.current, s: zoomRef.current.s - 0.75 })} disabled={!zoomed} aria-label="Diminuir zoom" className={cn(btn, "hidden disabled:opacity-30 sm:grid")}>
            <ZoomOut className="size-5" />
          </button>
          <button type="button" onClick={() => setZoom({ ...zoomRef.current, s: zoomRef.current.s + 0.75 })} disabled={zoom.s >= MAX} aria-label="Aumentar zoom" className={cn(btn, "hidden disabled:opacity-30 sm:grid")}>
            <ZoomIn className="size-5" />
          </button>
          <button type="button" onClick={onClose} aria-label="Fechar fotos" className={btn}>
            <X className="size-6" />
          </button>
        </div>
      </div>

      <div
        ref={stage}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className={cn("relative min-h-0 flex-1 touch-none select-none overflow-hidden", zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in")}
      >
        <div
          className={cn("flex h-full", !drag && !gesture.current && "transition-transform duration-300 ease-out")}
          style={{ transform: `translateX(calc(${-i * 100}% + ${drag}px))` }}
        >
          {Array.from({ length: total }, (_, n) => (
            <div key={n} className="grid h-full w-full shrink-0 place-items-center p-2 sm:px-20">
              <div
                className={cn("flex max-h-full w-full max-w-[min(100%,1400px)] items-center justify-center", n === i && !gesture.current && "transition-transform duration-200")}
                style={n === i ? { transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})` } : undefined}
              >
                {v.photos[n] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.photos[n]} alt={`${title}, foto ${n + 1}`} draggable={false} className="max-h-[calc(100dvh-180px)] w-auto max-w-full object-contain" loading={Math.abs(n - i) <= 1 ? "eager" : "lazy"} />
                ) : (
                  <VehiclePhoto vehicle={v} index={n} className="w-full max-w-[900px] rounded-xl" />
                )}
              </div>
            </div>
          ))}
        </div>

        {total > 1 && (
          <>
            <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => go(-1)} aria-label="Foto anterior" className={cn(btn, "absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 sm:grid")}>
              <ChevronLeft className="size-7" />
            </button>
            <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => go(1)} aria-label="Próxima foto" className={cn(btn, "absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 sm:grid")}>
              <ChevronRight className="size-7" />
            </button>
          </>
        )}
        {!zoomed && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/50">
            <span className="sm:hidden">Toque duas vezes ou use dois dedos para ampliar</span>
            <span className="hidden sm:inline">Clique ou use a roda do mouse para ampliar · ← → para navegar</span>
          </p>
        )}
      </div>

      {total > 1 && (
        <div ref={thumbs} className="flex shrink-0 gap-2 overflow-x-auto px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 scrollbar-none sm:justify-center sm:px-5">
          {Array.from({ length: total }, (_, n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setI(n);
                setZoom(NONE);
              }}
              aria-label={`Foto ${n + 1}`}
              aria-current={n === i}
              className={cn("w-20 shrink-0 overflow-hidden rounded-md ring-2 transition sm:w-24", n === i ? "opacity-100 ring-white" : "opacity-50 ring-transparent hover:opacity-80")}
            >
              <VehiclePhoto vehicle={v} index={n} className="aspect-[4/3]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
