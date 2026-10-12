"use client";

import "driver.js/dist/driver.css";

import { driver, type DriveStep } from "driver.js";
import { BookOpen, CirclePlay, MessageCircle, Plus, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { GLOSSARY, TOURS, tourForRoute } from "@/lib/tour";

type Ctx = { startTour: (id: string) => void; openHelp: () => void };
const TourCtx = createContext<Ctx>({ startTour: () => {}, openHelp: () => {} });
export const useTour = () => useContext(TourCtx);

const LOCAL_KEY = "torque:tours";

function readLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Primeiro elemento visível com data-tour=alvo (o menu do celular, por exemplo, fica escondido). */
function visibleTarget(target: string) {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`)) {
    if (el.getClientRects().length && getComputedStyle(el).visibility !== "hidden") return el;
  }
  return undefined;
}

/**
 * Tours guiados do Torque. Abre sozinho o tour de cada tela na primeira visita e guarda
 * o que já foi visto (no usuário, e no navegador como reserva).
 */
export function TourProvider({
  initialSeen,
  supportWhatsapp,
  children,
}: {
  initialSeen: string[];
  supportWhatsapp: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [helpOpen, setHelpOpen] = useState(false);
  const seen = useRef(new Set(initialSeen));
  const active = useRef<ReturnType<typeof driver> | null>(null);

  useEffect(() => {
    for (const id of readLocal()) seen.current.add(id);
  }, []);

  const markSeen = useCallback((id: string) => {
    if (seen.current.has(id)) return;
    seen.current.add(id);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify([...seen.current]));
    } catch {}
    fetch("/api/torque/tour", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);
  }, []);

  const startTour = useCallback(
    (id: string) => {
      const tour = TOURS.find((t) => t.id === id);
      if (!tour) return;
      active.current?.destroy();
      setHelpOpen(false);
      const steps: DriveStep[] = tour.steps.map((s) => {
        const el = s.target ? visibleTarget(s.target) : undefined;
        return { element: el, popover: { title: s.title, description: s.text, side: el ? s.side : undefined, align: "start" } };
      });
      const d = driver({
        steps,
        showProgress: steps.length > 1,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Próximo",
        prevBtnText: "Voltar",
        doneBtnText: "Entendi",
        popoverClass: "torque-tour",
        overlayOpacity: 0.55,
        stagePadding: 6,
        stageRadius: 12,
        smoothScroll: true,
        onDestroyed: () => {
          markSeen(tour.id);
          active.current = null;
        },
      });
      active.current = d;
      d.drive();
    },
    [markSeen],
  );

  // Primeira visita a uma tela com tour: abre sozinho depois que a página desenhou.
  useEffect(() => {
    const tour = tourForRoute(pathname);
    if (!tour || seen.current.has(tour.id)) return;
    const t = setTimeout(() => {
      if (!active.current && !seen.current.has(tour.id)) startTour(tour.id);
    }, 900);
    return () => clearTimeout(t);
  }, [pathname, startTour]);

  useEffect(() => () => active.current?.destroy(), []);

  return (
    <TourCtx.Provider value={{ startTour, openHelp: () => setHelpOpen(true) }}>
      {children}
      {helpOpen && (
        <HelpDrawer close={() => setHelpOpen(false)} startTour={startTour} pathname={pathname} supportWhatsapp={supportWhatsapp} />
      )}
    </TourCtx.Provider>
  );
}

function HelpDrawer({
  close,
  startTour,
  pathname,
  supportWhatsapp,
}: {
  close: () => void;
  startTour: (id: string) => void;
  pathname: string;
  supportWhatsapp: string | null;
}) {
  const current = tourForRoute(pathname);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-label="Central de ajuda">
      <button type="button" aria-label="Fechar ajuda" onClick={close} className="absolute inset-0 bg-black/40" />
      <aside className="relative flex h-full w-full max-w-[420px] flex-col overflow-y-auto bg-[#f5f5f7] shadow-2xl">
        <div className="flex items-center justify-between border-b bg-white px-5 py-4">
          <p className="font-heading text-xl font-semibold">Central de ajuda</p>
          <button type="button" onClick={close} aria-label="Fechar" className="grid size-9 place-items-center rounded-lg border hover:bg-[#f5f5f7]">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-5">
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b6b76]">Tours guiados</p>
            <div className="mt-3 flex flex-col gap-2">
              {current && (
                <button
                  type="button"
                  onClick={() => startTour(current.id)}
                  className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-left text-white"
                >
                  <CirclePlay className="size-5 shrink-0" /> Rever o tour desta tela ({current.name})
                </button>
              )}
              {current?.id !== "boas-vindas" && (
                <button
                  type="button"
                  onClick={() => startTour("boas-vindas")}
                  className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left hover:bg-[#fafafa]"
                >
                  <CirclePlay className="size-5 shrink-0 text-primary" /> Tour completo do Torque
                </button>
              )}
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer list-none text-[#6b6b76] hover:text-[#1f1f28]">Tours das outras telas</summary>
              <ul className="mt-2 flex flex-col gap-1 text-[#3d3d47]">
                {TOURS.filter((t) => t.id !== "boas-vindas" && t.id !== current?.id).map((t) => (
                  <li key={t.id}>
                    {t.name}
                    <span className="text-[#9a9aa5]"> · abra a tela e use “Rever o tour desta tela”</span>
                  </li>
                ))}
              </ul>
            </details>
          </section>

          <section>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#6b6b76]">
              <BookOpen className="size-3.5" /> Glossário
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {GLOSSARY.map((g) => (
                <details key={g.term} className="group rounded-lg border bg-white px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px]">
                    {g.term}
                    <Plus className="size-4 shrink-0 text-[#6b6b76] transition group-open:rotate-45" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-[#4a4a55]">{g.meaning}</p>
                </details>
              ))}
            </div>
          </section>

          <a
            href="https://ajuda.softmotors.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e2e8] bg-white p-5 hover:border-primary"
          >
            <span>
              <span className="block font-heading text-lg font-semibold">Central de Ajuda</span>
              <span className="mt-1 block text-sm text-[#6b6b76]">Passo a passo de todas as funções do Torque, por módulo.</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-primary">Abrir ↗</span>
          </a>

          <section className="rounded-xl bg-[#2a2a33] p-5 text-white">
            <p className="font-heading text-lg font-semibold">Ainda com dúvida?</p>
            <p className="mt-1 text-sm text-white/75">O time da SoftMotors responde no WhatsApp em horário comercial.</p>
            {supportWhatsapp && (
              <a
                href={`https://wa.me/${supportWhatsapp}?text=${encodeURIComponent(`Olá! Estou na tela ${pathname} do Torque e tenho uma dúvida.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold"
              >
                <MessageCircle className="size-4" /> Falar com a SoftMotors
              </a>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
