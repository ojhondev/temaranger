"use client";

import { CheckCircle2, Flame, Loader2, MessageSquareText, Phone, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { contactAction, type ContactState } from "@/app/(site)/actions";
import { FINANCING } from "@/config/ranger";
import type { LeadAction } from "@/db/schema";
import { brl } from "@/lib/format";
import type { ResolvedSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

import { SocialIcon } from "./social-links";

type Flow = ResolvedSettings["leadFlow"];
type Common = { vehicleId: number; storeName: string; flow: Flow };

/** Parcela pela Tabela Price. */
export function installment(principal: number, rate: number, n: number) {
  return (principal * rate) / (1 - Math.pow(1 + rate, -n));
}

const field = "h-12 w-full rounded-xl border border-[#dcdce3] bg-white px-4 text-[15px] outline-none placeholder:text-[#9a9aa5] focus:border-[#2e2e38]";

const ICON: Record<LeadAction, React.ReactNode> = {
  form: <MessageSquareText className="size-5" />,
  whatsapp: <SocialIcon name="whatsapp" />,
  call: <Phone className="size-5" />,
};

function actionClass(a: LeadAction, primary: boolean) {
  if (a === "whatsapp") return "bg-[#1faa53] text-white hover:brightness-95";
  if (primary) return "bg-primary text-white hover:brightness-95";
  return "border-2 border-[#2e2e38] text-[#2e2e38] hover:bg-[#f5f5f7]";
}

const button = "flex h-12 w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 text-[14px] font-bold transition active:scale-[.98] disabled:opacity-60 sm:text-[15px] [&_svg]:shrink-0";

/**
 * Formulário do fluxo: completo (mensagem) ou curto (nome e WhatsApp antes de abrir o
 * WhatsApp/ligação). Sem `askData`, WhatsApp e ligação viram um botão só.
 */
function ContactForm({ kind, vehicleId, storeName, flow, primary, onSent }: Common & { kind: LeadAction; primary: boolean; onSent?: () => void }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(contactAction, {});
  const full = kind === "form";
  const asks = full || flow.askData;

  useEffect(() => {
    if (state.url) window.location.href = state.url;
    if (state.ok) onSent?.();
  }, [state, onSent]);

  if (state.ok && !state.url && full) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-[#e9f8ee] p-4 text-sm font-semibold text-[#1c7a3c]">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
        Mensagem enviada! Um vendedor da {storeName} vai falar com você em instantes.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {asks && (
        <>
          <input name="name" required placeholder="Nome*" autoComplete="name" className={field} />
          {full && <input name="email" type="email" required={flow.emailRequired} placeholder={flow.emailRequired ? "E-mail*" : "E-mail"} autoComplete="email" className={field} />}
          <input name="phone" required inputMode="tel" placeholder="WhatsApp com DDD*" autoComplete="tel" className={field} />
        </>
      )}
      {full && (
        <>
          <textarea name="message" required rows={3} defaultValue="Olá, tenho interesse no veículo. Por favor entre em contato." className={cn(field, "h-auto resize-none py-3")} />
          <label className="flex items-start gap-3 text-[12px] leading-snug text-[#3d3d47]">
            <input type="checkbox" name="optIn" className="mt-0.5 size-4 accent-[var(--primary)]" />
            Quero receber contatos da {storeName} por e-mail, WhatsApp e outros canais.
          </label>
        </>
      )}
      {state.error && <p className="text-sm font-medium text-primary">{state.error}</p>}
      <button disabled={pending} className={cn(button, actionClass(kind, primary))}>
        {pending ? <Loader2 className="size-5 animate-spin" /> : ICON[kind]} {flow.labels[kind]}
      </button>
    </form>
  );
}

/** Gaveta que sobe da base da tela (celular) ou modal central (computador). */
function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal aria-label={title}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300 sm:max-w-[440px] sm:rounded-3xl sm:p-6"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#d6d6dc] sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-heading text-lg font-bold text-[#1f1f28]">{title}</p>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-9 place-items-center rounded-full bg-[#f2f2f4]">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Botão de uma ação: abre a gaveta quando precisa de dados, senão age direto. */
function ActionButton({ kind, primary, ...common }: Common & { kind: LeadAction; primary: boolean }) {
  const [open, setOpen] = useState(false);
  const needsSheet = kind === "form" || common.flow.askData;
  if (!needsSheet) return <ContactForm kind={kind} primary={primary} {...common} />;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(button, actionClass(kind, primary))}>
        {ICON[kind]} {common.flow.labels[kind]}
      </button>
      {open && (
        <Sheet title={kind === "form" ? common.flow.title : common.flow.labels[kind]} onClose={() => setOpen(false)}>
          {kind !== "form" && <p className="mb-4 text-sm text-[#6b6b76]">Informe seus dados para o vendedor identificar você.</p>}
          <ContactForm kind={kind} primary={primary} {...common} />
        </Sheet>
      )}
    </>
  );
}

function actionsOf(flow: Flow) {
  const list: LeadAction[] = [flow.primary];
  if (flow.secondary !== "none" && flow.secondary !== flow.primary) list.push(flow.secondary);
  return list;
}

/** Simulação "Ver parcelas" (Tabela Price, entrada mínima do tema). */
function Installments({ price, rate, onClose }: { price: number; rate: number; onClose: () => void }) {
  const down = Math.round(price * FINANCING.minDownPayment);
  return (
    <div className="relative mt-4 rounded-xl bg-[#f5f6f7] p-4 text-sm">
      <button type="button" onClick={onClose} className="absolute right-2 top-2" aria-label="Fechar">
        <X className="size-4" />
      </button>
      <p className="font-semibold">Entrada a partir de {brl(down)}</p>
      <ul className="mt-2 space-y-1">
        {FINANCING.terms.map((n) => (
          <li key={n} className="flex justify-between">
            <span>{n}x</span>
            <span className="font-semibold">{brl(installment(price - down, rate, n))}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-[#6b6b76]">Simulação com taxa de {(rate * 100).toFixed(2).replace(".", ",")}% a.m., sujeita a análise de crédito.</p>
    </div>
  );
}

/** Card lateral (computador): preço, parcelas e a área de contato configurada no Torque. */
export function PdpContactCard({ price, rate, ...common }: Common & { price: number; rate: number }) {
  const [parcelas, setParcelas] = useState(false);
  const [primary, ...rest] = actionsOf(common.flow);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_6px_28px_rgba(0,0,0,.12)]">
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading text-[32px] font-semibold tracking-tight text-[#2e2e38]">{brl(price)}</p>
        <button type="button" onClick={() => setParcelas((s) => !s)} className="flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-xs font-bold text-white hover:brightness-95">
          Ver parcelas <Flame className="size-4" />
        </button>
      </div>
      {parcelas && <Installments price={price} rate={rate} onClose={() => setParcelas(false)} />}

      <div className="mt-5 flex flex-col gap-3">
        {primary === "form" ? (
          <>
            <p className="text-xs text-[#6b6b76]">{common.flow.title}</p>
            <ContactForm kind="form" primary {...common} />
          </>
        ) : (
          <ActionButton kind={primary} primary {...common} />
        )}
        {rest.map((a) => (
          <ActionButton key={a} kind={a} primary={false} {...common} />
        ))}
      </div>
    </div>
  );
}

/** Bloco de preço do celular: preço grande e parcela estimada, como nos apps de classificados. */
export function PdpMobilePrice({ price, rate }: { price: number; rate: number }) {
  const [parcelas, setParcelas] = useState(false);
  const down = Math.round(price * FINANCING.minDownPayment);
  const n = FINANCING.terms[FINANCING.terms.length - 1];
  return (
    <div>
      <p className="font-heading text-[34px] font-bold leading-none tracking-tight text-[#1f1f28]">{brl(price)}</p>
      <p className="mt-2 text-[13px] text-[#6b6b76]">
        Parcelas estimadas: {n}x {brl(installment(price - down, rate, n))}*{" "}
        <button type="button" onClick={() => setParcelas((s) => !s)} className="font-semibold text-primary underline underline-offset-2">
          Ver parcelas
        </button>
      </p>
      {parcelas && <Installments price={price} rate={rate} onClose={() => setParcelas(false)} />}
    </div>
  );
}

/** Barra fixa no rodapé do celular com as ações de contato (no lugar do menu de abas). */
export function PdpActionBar(common: Common) {
  const actions = actionsOf(common.flow);
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ececf0] bg-white/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur lg:hidden">
      <div className={cn("grid gap-2.5", actions.length > 1 && "grid-cols-2")}>
        {actions.map((a, i) => (
          <ActionButton key={a} kind={a} primary={i === 0} {...common} />
        ))}
      </div>
    </div>
  );
}
