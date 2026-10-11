"use client";

import { CheckCircle2, Flame, X } from "lucide-react";
import { useState } from "react";

import { submitInterest } from "@/app/(site)/actions";
import { FINANCING } from "@/config/ranger";
import { brl } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Parcela pela Tabela Price. */
function installment(principal: number, rate: number, n: number) {
  return (principal * rate) / (1 - Math.pow(1 + rate, -n));
}

const field =
  "w-full rounded-md border border-[#dcdce3] px-4 text-sm outline-none placeholder:text-[#9a9aa5] focus:border-[#6b6b76]";

/** Card fixo da PDP: preço, "Ver parcelas" e formulário de mensagem ao vendedor. */
export function PdpLeadCard({
  vehicleId,
  price,
  storeName,
  sent,
  error,
  rate = FINANCING.monthlyRate,
}: {
  vehicleId: number;
  price: number;
  storeName: string;
  sent: boolean;
  error: boolean;
  rate?: number;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "Olá, tenho interesse no veículo. Por favor entre em contato." });
  const [showParcelas, setShowParcelas] = useState(false);
  const [pending, setPending] = useState(false);
  const valid =
    form.name.trim().length > 1 &&
    /^\S+@\S+\.\S+$/.test(form.email) &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    form.message.trim().length > 0;

  const down = Math.round(price * FINANCING.minDownPayment);

  return (
    <div className="rounded-xl bg-white p-6 shadow-[0_6px_28px_rgba(0,0,0,.12)]">
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading text-[32px] font-semibold tracking-tight text-[#2e2e38]">{brl(price)}</p>
        <button
          type="button"
          onClick={() => setShowParcelas((s) => !s)}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2.5 text-xs font-bold text-white hover:brightness-95"
        >
          Ver parcelas <Flame className="size-4" />
        </button>
      </div>

      {showParcelas && (
        <div className="relative mt-4 rounded-lg bg-[#f5f6f7] p-4 text-sm">
          <button type="button" onClick={() => setShowParcelas(false)} className="absolute right-2 top-2" aria-label="Fechar">
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
          <p className="mt-2 text-[11px] text-[#6b6b76]">
            Simulação com taxa de {(rate * 100).toFixed(2).replace(".", ",")}% a.m., sujeita a análise de crédito.
          </p>
        </div>
      )}

      {sent ? (
        <p className="mt-6 flex items-start gap-2 rounded-lg bg-[#e9f8ee] p-4 text-sm font-semibold text-[#1c7a3c]">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          Mensagem enviada! Um vendedor da {storeName} vai falar com você em instantes.
        </p>
      ) : (
        <form action={submitInterest} onSubmit={() => setPending(true)} className="mt-1 flex flex-col gap-3">
          <p className="mb-2 text-xs text-[#6b6b76]">Envie uma mensagem ao vendedor</p>
          <input type="hidden" name="vehicleId" value={vehicleId} />
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <input
            name="name"
            required
            placeholder="Nome*"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={cn(field, "h-10")}
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail*"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={cn(field, "h-10")}
          />
          <input
            name="phone"
            required
            inputMode="tel"
            placeholder="Telefone*"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={cn(field, "h-10")}
          />
          <div className="relative">
            <span className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-[#9a9aa5]">Mensagem*</span>
            <textarea
              name="message"
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={cn(field, "resize-none py-3")}
            />
          </div>
          <label className="flex items-start gap-3 text-[11px] leading-snug text-[#3d3d47]">
            <input type="checkbox" name="optIn" className="mt-0.5 size-4 accent-[var(--primary)]" />
            Quero receber contatos da {storeName} por e-mail, WhatsApp e outros canais.
          </label>
          {error && <p className="text-xs text-primary">Confira seu nome e telefone com DDD.</p>}
          <button
            disabled={!valid || pending}
            className="mt-2 h-12 rounded-md bg-primary text-sm font-semibold text-white transition disabled:bg-primary/30"
          >
            {pending ? "Enviando…" : "Enviar mensagem"}
          </button>
        </form>
      )}
    </div>
  );
}
