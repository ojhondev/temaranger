"use client";

import { Check, Copy, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { createClient, type CreateClientState } from "@/app/torque/actions/clients";
import { ColorField } from "@/components/torque/color-field";
import { Field, field } from "@/components/torque/ui";
import { slugify } from "@/lib/format";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
      <span className="min-w-0">
        <span className="block text-[11px] text-[#6b6b76]">{label}</span>
        <span className="block truncate font-mono text-sm">{value}</span>
      </span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value).catch(() => null);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }}
        className="grid size-8 shrink-0 place-items-center rounded-md hover:bg-[#f5f5f7]"
        aria-label={`Copiar ${label}`}
      >
        {done ? <Check className="size-4 text-[#1c9b4a]" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

export function NewClientForm({ platformDomain }: { platformDomain: string }) {
  const [state, action, pending] = useActionState<CreateClientState, FormData>(createClient, { status: "idle" });
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const effectiveSlug = slugTouched ? slug : slugify(name).slice(0, 40);

  if (state.status === "ok") {
    return (
      <div className="flex flex-col gap-3 rounded-xl bg-[#e7f7ed] p-4">
        <p className="font-semibold text-[#1d6b3d]">{state.name} está no ar 🎉</p>
        <p className="text-sm text-[#1d6b3d]">Envie estes dados ao gestor. A senha aparece só agora: ele troca em Conta no primeiro acesso.</p>
        <CopyRow label="Site e Torque" value={`https://${state.host}`} />
        <CopyRow label="Login" value={state.email} />
        <CopyRow label="Senha provisória" value={state.password} />
        {!state.domainRegistered && (
          <p className="rounded-lg bg-[#fff8e6] px-3 py-2 text-xs text-[#7a5300]">
            O endereço ainda não foi registrado na Vercel ({state.domainError}). Rode o comando mostrado na lista para ativá-lo.
          </p>
        )}
        <button type="button" onClick={() => location.reload()} className="mt-1 h-10 rounded-lg bg-[#2a2a33] text-sm font-semibold text-white">
          Criar outra loja
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <Field label="Nome da loja *">
        <input name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Auto Prime Multimarcas" className={field} />
      </Field>
      <Field label="Endereço" hint={`${effectiveSlug || "sualoja"}.${platformDomain}`}>
        <input
          name="slug"
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          className={field}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cidade - UF *">
          <input name="city" required placeholder="Curitiba - PR" className={field} />
        </Field>
        <Field label="WhatsApp da loja">
          <input name="whatsapp" inputMode="tel" className={field} />
        </Field>
      </div>
      <Field label="Nome da 1ª unidade" hint="Opcional; padrão = nome da loja.">
        <input name="storeName" className={field} />
      </Field>
      <Field label="Cor da marca">
        <ColorField name="primaryColor" defaultValue="#e3173e" />
      </Field>
      <div className="mt-1 border-t pt-3">
        <p className="mb-2 text-sm font-semibold">Gestor da loja</p>
        <div className="grid gap-3">
          <Field label="Nome *">
            <input name="managerName" required className={field} />
          </Field>
          <Field label="E-mail (login) *">
            <input name="managerEmail" type="email" required className={field} />
          </Field>
        </div>
      </div>
      {state.status === "error" && <p className="rounded-lg bg-[#fde8e8] px-3 py-2 text-sm text-[#a3242f]">{state.error}</p>}
      <button disabled={pending} className="mt-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white disabled:opacity-60">
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Criando a loja…" : "Criar loja e colocar no ar"}
      </button>
    </form>
  );
}
