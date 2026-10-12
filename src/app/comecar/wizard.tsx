"use client";

import { upload } from "@vercel/blob/client";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, Search, Trash2 } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { captureDemoLead, startDemo, type StartState } from "./actions";

type Data = { contactName: string; dealership: string; whatsapp: string; city: string; primaryColor: string; logoUrl: string };

const COLORS = ["#ff3916", "#e3173e", "#c8102e", "#1f4fbf", "#0f766e", "#16a34a", "#ea580c", "#7c3aed", "#0f172a", "#b45309"];

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

type Step = { key: keyof Data; q: (d: Data) => string; hint: string; optional?: boolean };
const STEPS: Step[] = [
  { key: "contactName", q: () => "Para começar, qual é o seu nome?", hint: "Vamos montar o site da sua loja em menos de 1 minuto." },
  { key: "dealership", q: (d) => `Prazer, ${d.contactName.split(" ")[0]}! Qual é o nome da sua concessionária?`, hint: "É o nome que vai aparecer no site." },
  { key: "whatsapp", q: () => "Qual WhatsApp recebe os clientes?", hint: "Os contatos de teste do site vão chegar nele, como na vida real." },
  { key: "city", q: () => "Em qual cidade fica a loja?", hint: "Exemplo: Campinas - SP" },
  { key: "primaryColor", q: () => "Qual é a cor da sua marca?", hint: "Botões, preços e destaques do site usam essa cor." },
  { key: "logoUrl", q: () => "Envie o logo da loja", hint: "PNG ou JPG, de preferência com fundo transparente. Se não tiver agora, pode pular.", optional: true },
];

/** Prévia ao vivo do site com a marca digitada. */
function Preview({ d }: { d: Data }) {
  const name = d.dealership || "Sua concessionária";
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,.18)]" style={{ "--c": d.primaryColor } as React.CSSProperties}>
      <div className="flex h-8 items-center gap-1.5 bg-[#ececf0] px-3">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />
        ))}
        <span className="ml-3 h-4 flex-1 rounded bg-white/80 px-2 text-[9px] leading-4 text-[#6b6b76]">demo.softmotors.com.br</span>
      </div>
      <div className="flex items-center gap-3 border-b border-[#f0f0f3] px-4 py-3">
        {d.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.logoUrl} alt="" className="h-6 max-w-[110px] object-contain" />
        ) : (
          <span className="max-w-[140px] truncate text-sm font-bold">{name}</span>
        )}
        <span className="flex h-7 flex-1 items-center gap-1.5 rounded-full bg-[#f2f2f4] px-3 text-[10px] text-[#9a9aa5]">
          <Search className="size-3" /> Buscar “Carro”
        </span>
        <span className="rounded-full px-3 py-1.5 text-[10px] font-bold text-white" style={{ background: "var(--c)" }}>
          Quero vender
        </span>
      </div>
      <div className="p-4">
        <div className="flex h-28 flex-col justify-center rounded-xl bg-gradient-to-r from-[#2a2a33] to-[#55555f] px-5 text-white">
          <p className="text-sm font-bold leading-tight">Seu próximo SUV seminovo</p>
          <p className="mt-1 text-[10px] opacity-80">Encontre o seu na {name}</p>
          <span className="mt-2 w-fit rounded-full px-3 py-1 text-[10px] font-bold text-white" style={{ background: "var(--c)" }}>
            Ver ofertas
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["R$ 89.900", "R$ 124.500", "R$ 67.990"].map((p) => (
            <div key={p}>
              <div className="aspect-[4/3] rounded-lg bg-[#eef0f3]" />
              <p className="mt-1 text-[11px] font-bold" style={{ color: "var(--c)" }}>
                {p}
              </p>
              <p className="text-[9px] text-[#9a9aa5]">{d.city || "Sua cidade"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Wizard({ initial, leadId: initialLead, activeDemo }: { initial: Data; leadId: number | null; activeDemo: string | null }) {
  const [d, setD] = useState<Data>({ ...initial, whatsapp: maskPhone(initial.whatsapp) });
  const [i, setI] = useState(0);
  const [leadId, setLeadId] = useState(initialLead);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [state, action, pending] = useActionState<StartState, FormData>(startDemo, {});
  const input = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  useEffect(() => {
    input.current?.focus();
    setError("");
  }, [i]);

  function valid(k: keyof Data) {
    if (k === "whatsapp") return d.whatsapp.replace(/\D/g, "").length >= 10;
    if (k === "logoUrl") return true;
    if (k === "primaryColor") return /^#[0-9a-f]{6}$/i.test(d.primaryColor);
    return d[k].trim().length >= 2;
  }

  async function next() {
    if (!valid(step.key)) {
      setError(step.key === "whatsapp" ? "Informe o WhatsApp com DDD." : "Preencha para continuar.");
      return;
    }
    if (step.key === "whatsapp") {
      const id = await captureDemoLead({ contactName: d.contactName, dealership: d.dealership, whatsapp: d.whatsapp });
      if (id) setLeadId(id);
    }
    if (last) form.current?.requestSubmit();
    else setI(i + 1);
  }

  async function onLogo(files: FileList | null) {
    const f = files?.[0];
    if (!f || !leadId) return;
    if (f.size > 5 * 1024 * 1024) return setError("Imagem acima de 5 MB.");
    setUploading(true);
    setError("");
    try {
      const safe = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const blob = await upload(`demo/${leadId}/${safe}`, f, { access: "public", handleUploadUrl: "/api/demo/upload" });
      setD((x) => ({ ...x, logoUrl: blob.url }));
    } catch {
      setError("Não foi possível enviar. Tente PNG ou JPG.");
    } finally {
      setUploading(false);
    }
  }

  const set = (k: keyof Data, v: string) => setD((x) => ({ ...x, [k]: k === "whatsapp" ? maskPhone(v) : v }));
  const big = "w-full border-b-2 border-[#d6d6dc] bg-transparent pb-2 text-[clamp(1.4rem,3.2vw,2rem)] font-medium text-[#1f1f28] outline-none placeholder:text-[#c4c4cc] focus:border-[var(--c)]";

  if (pending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#1f1f28] px-6 text-center text-white" style={{ "--c": d.primaryColor } as React.CSSProperties}>
        <div className="flex flex-col items-center gap-5">
          <Loader2 className="size-10 animate-spin" style={{ color: d.primaryColor }} />
          <p className="font-heading text-2xl font-semibold">Montando o site da {d.dealership}…</p>
          <p className="max-w-sm text-white/60">Aplicando sua marca, criando o estoque de exemplo e preparando o painel Torque.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-dvh bg-white font-heading lg:grid-cols-[1fr_1fr]" style={{ "--c": d.primaryColor } as React.CSSProperties}>
      <div className="fixed inset-x-0 top-0 z-10 h-1 bg-[#f0f0f3]">
        <div className="h-full transition-all duration-500" style={{ width: `${((i + 1) / STEPS.length) * 100}%`, background: d.primaryColor }} />
      </div>

      <section className="flex min-h-dvh flex-col px-6 py-8 sm:px-12 lg:px-16">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/softmotors-logo.png" alt="SoftMotors" className="h-6 w-auto" />
          <span className="text-sm text-[#9a9aa5]">Demonstração em tempo real</span>
        </div>

        {activeDemo && i === 0 && (
          // eslint-disable-next-line @next/next/no-html-link-for-pages -- recarrega a página inteira para abrir a loja da demonstração
          <a href="/" className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-[#f5f5f7] px-4 py-3 text-sm">
            <span>
              Você já tem uma demonstração: <strong>{activeDemo}</strong>
            </span>
            <span className="font-semibold" style={{ color: d.primaryColor }}>
              Abrir →
            </span>
          </a>
        )}

        <form
          ref={form}
          action={action}
          onSubmit={(e) => {
            if (!last) e.preventDefault();
          }}
          className="flex flex-1 flex-col justify-center py-10"
        >
          {(Object.keys(d) as (keyof Data)[]).map((k) => (
            <input key={k} type="hidden" name={k} value={d[k]} />
          ))}
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          <div key={i} className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: d.primaryColor }}>
              {i + 1} <ArrowRight className="size-4" />
            </p>
            <h1 className="mt-2 text-[clamp(1.5rem,3.4vw,2.2rem)] font-semibold leading-tight text-[#1f1f28]">{step.q(d)}</h1>
            <p className="mt-2 text-[#6b6b76]">{step.hint}</p>

            <div className="mt-8">
              {step.key === "primaryColor" ? (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set("primaryColor", c)}
                        aria-label={`Usar ${c}`}
                        className={cn("grid size-12 place-items-center rounded-full ring-offset-2 transition hover:scale-105", d.primaryColor === c && "ring-2 ring-[#1f1f28]")}
                        style={{ background: c }}
                      >
                        {d.primaryColor === c && <Check className="size-5 text-white" />}
                      </button>
                    ))}
                  </div>
                  <label className="flex w-fit items-center gap-3 text-sm text-[#3d3d47]">
                    <input type="color" value={d.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-[#d6d6dc] p-1" />
                    Outra cor: <span className="font-mono">{d.primaryColor.toUpperCase()}</span>
                  </label>
                </div>
              ) : step.key === "logoUrl" ? (
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => file.current?.click()}
                    disabled={uploading || !leadId}
                    className="flex h-28 w-64 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#d6d6dc] text-sm font-medium text-[#3d3d47] hover:border-[var(--c)]"
                  >
                    {uploading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : d.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.logoUrl} alt="Logo" className="max-h-20 max-w-[220px] object-contain" />
                    ) : (
                      <>
                        <ImagePlus className="size-5" /> Escolher imagem
                      </>
                    )}
                  </button>
                  {d.logoUrl && (
                    <button type="button" onClick={() => set("logoUrl", "")} className="flex items-center gap-1.5 text-sm text-[#6b6b76] hover:text-[#1f1f28]">
                      <Trash2 className="size-4" /> Remover
                    </button>
                  )}
                  <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onLogo(e.target.files)} />
                </div>
              ) : (
                <input
                  ref={input}
                  value={d[step.key]}
                  onChange={(e) => set(step.key, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      next();
                    }
                  }}
                  inputMode={step.key === "whatsapp" ? "tel" : "text"}
                  autoComplete={step.key === "contactName" ? "name" : step.key === "whatsapp" ? "tel" : step.key === "city" ? "address-level2" : "organization"}
                  placeholder={step.key === "whatsapp" ? "(11) 99999-0000" : "Digite aqui…"}
                  className={big}
                />
              )}
            </div>

            {(step.key === "primaryColor" || step.key === "logoUrl") && (
              <div className="mt-8 max-w-sm lg:hidden">
                <Preview d={d} />
              </div>
            )}

            {(error || state.error) && <p className="mt-4 text-sm font-medium text-[#d1242f]">{error || state.error}</p>}

            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={next}
                disabled={uploading}
                className="flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-bold text-white transition hover:brightness-95 active:scale-[.98] disabled:opacity-60"
                style={{ background: d.primaryColor }}
              >
                {last ? (d.logoUrl ? "Ver meu site pronto" : "Pular e ver meu site") : "OK"} {last ? <ArrowRight className="size-4" /> : <Check className="size-4" />}
              </button>
              {!last && step.key !== "primaryColor" && <span className="hidden text-xs text-[#9a9aa5] sm:block">ou pressione Enter ↵</span>}
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} className="flex items-center gap-1.5 text-[#6b6b76] disabled:opacity-0">
            <ArrowLeft className="size-4" /> Voltar
          </button>
          <span className="text-[#9a9aa5]">
            {i + 1} de {STEPS.length}
          </span>
        </div>
      </section>

      <aside className="hidden items-center justify-center bg-[#f3f3f6] p-12 lg:flex">
        <div className="w-full max-w-[520px]">
          <p className="mb-4 text-center text-sm font-medium text-[#6b6b76]">Prévia ao vivo do seu site</p>
          <Preview d={d} />
        </div>
      </aside>
    </main>
  );
}
