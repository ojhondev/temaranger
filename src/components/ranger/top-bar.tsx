"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import type { ResolvedSettings } from "@/lib/settings";

/** Faixa de aviso acima do header. Fechada, some até o fim da visita. */
export function TopBar({ bar }: { bar: ResolvedSettings["topBar"] }) {
  const key = `ranger:topbar:${bar.text}`;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(key)) setHidden(true);
    } catch {}
  }, [key]);

  if (!bar.enabled || !bar.text || hidden) return null;

  function close() {
    setHidden(true);
    try {
      sessionStorage.setItem(key, "1");
    } catch {}
  }

  const external = /^https?:/.test(bar.href);
  return (
    <div className="relative flex min-h-9 items-center justify-center gap-x-3 px-10 py-2 text-center text-[13px] font-medium leading-snug" style={{ background: bar.bg, color: bar.fg }}>
      <p>
        {bar.text}
        {bar.href && (
          <a href={bar.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="ml-2 font-bold underline underline-offset-2">
            {bar.linkLabel || "Saiba mais"}
          </a>
        )}
      </p>
      {bar.dismissible && (
        <button type="button" onClick={close} aria-label="Fechar aviso" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full opacity-80 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
