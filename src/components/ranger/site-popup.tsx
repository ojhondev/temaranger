"use client";

import { CheckCircle2, Loader2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { contactAction, type ContactState } from "@/app/(site)/actions";
import type { ResolvedSettings } from "@/lib/settings";

const WINDOW = { always: 0, session: -1, day: 86_400_000, week: 7 * 86_400_000 } as const;
const input = "h-12 w-full rounded-xl border border-[#dcdce3] px-4 text-[15px] outline-none focus:border-[#2e2e38]";

/** Pop-up de abertura: aparece depois de N segundos, na frequência escolhida pela loja. */
export function SitePopup({ popup, whatsapp }: { popup: ResolvedSettings["popup"]; whatsapp: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ContactState, FormData>(contactAction, {});
  const key = `ranger:popup:${popup.title}|${popup.text}`;

  useEffect(() => {
    if (!popup.enabled || (popup.pages === "home" && pathname !== "/")) return;
    try {
      const store = popup.frequency === "session" ? sessionStorage : localStorage;
      const last = Number(store.getItem(key) ?? 0);
      const wait = WINDOW[popup.frequency];
      if (last && (wait === -1 || Date.now() - last < wait)) return;
    } catch {}
    const t = setTimeout(() => setOpen(true), Math.max(0, popup.delaySeconds) * 1000);
    return () => clearTimeout(t);
  }, [popup, pathname, key]);

  useEffect(() => {
    if (state.url) window.location.href = state.url;
  }, [state.url]);

  if (!open) return null;

  function close() {
    setOpen(false);
    try {
      (popup.frequency === "session" ? sessionStorage : localStorage).setItem(key, String(Date.now()));
    } catch {}
  }

  const cta = "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-bold text-white transition hover:brightness-95 active:scale-[.98]";
  const waHref = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(popup.title || "Olá! Vim pelo site.")}` : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-6" onClick={close} role="dialog" aria-modal aria-label={popup.title || "Aviso"}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl animate-in slide-in-from-bottom duration-300 sm:max-w-[440px] sm:rounded-3xl sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        <button type="button" onClick={close} aria-label="Fechar" className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/90 shadow">
          <X className="size-5" />
        </button>
        {popup.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={popup.imageUrl} alt="" className="aspect-[4/3] w-full object-cover sm:rounded-t-3xl" />
        )}
        <div className="flex flex-col gap-3 p-6">
          {popup.title && <p className="pr-8 font-heading text-[22px] font-bold leading-tight text-[#1f1f28]">{popup.title}</p>}
          {popup.text && <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#4a4a55]">{popup.text}</p>}

          {popup.action === "lead" &&
            (state.ok ? (
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-[#e9f8ee] p-4 text-sm font-semibold text-[#1c7a3c]">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> Pronto! Em breve a loja fala com você.
              </p>
            ) : (
              <form action={action} className="mt-2 flex flex-col gap-3">
                <input type="hidden" name="kind" value="popup" />
                <input type="hidden" name="popupTitle" value={popup.title} />
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <input name="name" required placeholder="Seu nome" autoComplete="name" className={input} />
                <input name="phone" required inputMode="tel" placeholder="WhatsApp com DDD" autoComplete="tel" className={input} />
                {state.error && <p className="text-sm font-medium text-primary">{state.error}</p>}
                <button disabled={pending} className={cta}>
                  {pending && <Loader2 className="size-4 animate-spin" />} {popup.ctaLabel}
                </button>
              </form>
            ))}
          {popup.action === "link" && popup.href && (
            <a href={popup.href} onClick={close} className={`${cta} mt-2`}>
              {popup.ctaLabel}
            </a>
          )}
          {popup.action === "whatsapp" && waHref && (
            <a href={waHref} target="_blank" rel="noopener noreferrer" onClick={close} className={`${cta} mt-2 bg-[#1faa53]`}>
              {popup.ctaLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
