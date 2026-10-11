"use client";

import { Check, CheckCircle2, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { connectMarketplace } from "@/app/torque/actions/marketplaces";
import type { Marketplace } from "@/db/schema";
import { cn } from "@/lib/utils";

import { PortalLogo } from "./portal-logo";
import { field } from "./ui";

const NAMES: Record<Marketplace, string> = { olx: "OLX", webmotors: "WebMotors", mercadolivre: "Mercado Livre" };
const ACCOUNT_HINT: Record<Marketplace, string> = {
  olx: "E-mail da conta profissional da loja na OLX",
  webmotors: "CNPJ ou usuário da loja no Cockpit WebMotors",
  mercadolivre: "E-mail ou apelido da conta da loja no Mercado Livre",
};

/**
 * Assistente "Conectar portal" em 3 passos: conta → o que anunciar → pronto.
 * `prices` é a lista de preços do estoque disponível, para mostrar quantos carros entram.
 */
export function ConnectWizard({
  mp,
  storeName,
  prices,
  label = "Conectar",
  variant = "primary",
}: {
  mp: Marketplace;
  storeName: string;
  prices: number[];
  label?: string;
  variant?: "primary" | "outline";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState("");
  const [scope, setScope] = useState<"all" | "manual">("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [result, setResult] = useState<{ published: number } | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const min = Number(minPrice.replace(/\D/g, "")) || 0;
  const max = Number(maxPrice.replace(/\D/g, "")) || 0;
  const willPublish = scope === "manual" ? 0 : prices.filter((p) => (!min || p >= min) && (!max || p <= max)).length;

  function reset() {
    if (result) router.refresh();
    setOpen(false);
    setStep(1);
    setResult(null);
    setError("");
  }

  function finish() {
    setError("");
    start(async () => {
      const r = await connectMarketplace({ marketplace: mp, accountName: account, scope, minPrice: min, maxPrice: max });
      if (!r.ok) return setError(r.error);
      setResult({ published: r.published });
      setStep(3);
    });
  }

  const steps = ["Conta do portal", "O que anunciar", "Pronto"];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "h-10 rounded-lg px-5 text-sm font-semibold",
          variant === "primary" ? "bg-primary text-white hover:brightness-95" : "border border-[#d6d6dc] hover:bg-[#f5f5f7]",
        )}
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Conectar ${NAMES[mp]}`}>
          <button type="button" aria-label="Fechar" onClick={reset} className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center gap-4 border-b px-6 py-5">
              <PortalLogo mp={mp} className="h-12 min-w-24 text-sm" />
              <div className="flex-1">
                <p className="text-lg font-semibold">Conectar {NAMES[mp]}</p>
                <p className="text-sm text-[#6b6b76]">Leva menos de 1 minuto.</p>
              </div>
              <button type="button" onClick={reset} aria-label="Fechar" className="grid size-9 place-items-center rounded-lg hover:bg-[#f5f5f7]">
                <X className="size-5" />
              </button>
            </div>

            {/* indicador de passos */}
            <ol className="flex items-center gap-2 px-6 pt-5">
              {steps.map((label, i) => {
                const n = i + 1;
                const done = step > n;
                return (
                  <li key={label} className="flex flex-1 items-center gap-2">
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                        done ? "bg-[#1c9b4a] text-white" : step === n ? "bg-[#2a2a33] text-white" : "bg-[#ececf1] text-[#6b6b76]",
                      )}
                    >
                      {done ? <Check className="size-4" /> : n}
                    </span>
                    <span className={cn("text-xs font-medium", step === n ? "text-[#1f1f28]" : "text-[#6b6b76]")}>{label}</span>
                    {n < 3 && <span className="h-px flex-1 bg-[#e2e2e8]" />}
                  </li>
                );
              })}
            </ol>

            <div className="px-6 py-6">
              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-[#4a4a55]">
                    Informe a conta da <b>{storeName}</b> no {NAMES[mp]}. Os anúncios serão publicados nela.
                  </p>
                  <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                    {ACCOUNT_HINT[mp]}
                    <input autoFocus value={account} onChange={(e) => setAccount(e.target.value)} className={field} />
                  </label>
                  <button
                    type="button"
                    disabled={!account.trim()}
                    onClick={() => setStep(2)}
                    className="h-11 rounded-lg bg-[#2a2a33] text-sm font-semibold text-white disabled:opacity-40"
                  >
                    Autorizar e continuar
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  {[
                    { v: "all" as const, t: "Todo o estoque disponível", d: "Recomendado. Cada carro novo também é anunciado sozinho." },
                    { v: "manual" as const, t: "Escolher carro a carro", d: "Você liga o anúncio de cada veículo na tela do Estoque." },
                  ].map((o) => (
                    <label
                      key={o.v}
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border p-4",
                        scope === o.v ? "border-primary bg-[#eef1fd]" : "border-[#e2e2e8]",
                      )}
                    >
                      <input type="radio" name="scope" checked={scope === o.v} onChange={() => setScope(o.v)} className="mt-1 accent-[#4f6be6]" />
                      <span>
                        <span className="block text-sm font-semibold">{o.t}</span>
                        <span className="text-xs text-[#6b6b76]">{o.d}</span>
                      </span>
                    </label>
                  ))}
                  {scope === "all" && (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1 text-xs font-medium text-[#6b6b76]">
                        Preço mínimo (opcional)
                        <input inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="R$ 0" className={field} />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium text-[#6b6b76]">
                        Preço máximo (opcional)
                        <input inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Sem limite" className={field} />
                      </label>
                    </div>
                  )}
                  <p className="rounded-lg bg-[#f5f5f7] px-4 py-3 text-sm">
                    {scope === "all" ? (
                      <>
                        <b>{willPublish}</b> {willPublish === 1 ? "veículo será anunciado" : "veículos serão anunciados"} agora no {NAMES[mp]}.
                      </>
                    ) : (
                      "Nenhum anúncio é criado agora: escolha os carros no Estoque."
                    )}
                  </p>
                  {error && <p className="text-sm text-primary">{error}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep(1)} className="h-11 rounded-lg border px-5 text-sm font-semibold">
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={finish}
                      disabled={pending}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {pending && <Loader2 className="size-4 animate-spin" />}
                      {pending ? "Publicando anúncios…" : "Conectar e publicar"}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && result && (
                <div className="flex flex-col items-center gap-3 py-2 text-center">
                  <CheckCircle2 className="size-14 text-[#1c9b4a]" />
                  <p className="text-xl font-semibold">{NAMES[mp]} conectado!</p>
                  <p className="text-sm text-[#4a4a55]">
                    {result.published} {result.published === 1 ? "anúncio ativo" : "anúncios ativos"}. Daqui em diante, preço, fotos e status
                    são atualizados sozinhos, e carro vendido sai do portal.
                  </p>
                  <button type="button" onClick={reset} className="mt-2 h-11 w-full rounded-lg bg-[#2a2a33] text-sm font-semibold text-white">
                    Concluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
