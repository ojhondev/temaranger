"use client";

import { ArrowLeft, Check, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Compartilhar pelo menu nativo do celular; sem ele, copia o link. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = window.location.href.split("?")[0];
    try {
      if (navigator.share) return await navigator.share({ title, url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }
  return (
    <button type="button" onClick={share} aria-label="Compartilhar" className="grid size-10 place-items-center rounded-full active:bg-[#f2f2f4]">
      {copied ? <Check className="size-6 text-[#1c7a3c]" /> : <Share2 className="size-6" />}
    </button>
  );
}

/** Voltar como num app: volta no histórico, ou vai para a busca se a pessoa chegou direto. */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 && document.referrer.startsWith(window.location.origin) ? router.back() : router.push("/estoque"))}
      aria-label="Voltar"
      className="grid size-10 place-items-center rounded-full active:bg-[#f2f2f4]"
    >
      <ArrowLeft className="size-6" />
    </button>
  );
}
