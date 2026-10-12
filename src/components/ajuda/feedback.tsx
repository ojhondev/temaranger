"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

/** "Este artigo foi útil?" — só agradece; o voto não é gravado. */
export function Feedback() {
  const [vote, setVote] = useState<"sim" | "nao" | null>(null);
  if (vote) {
    return (
      <p className="text-sm font-medium text-[#1c7a3c]">
        {vote === "sim" ? "Que bom! Obrigado pelo retorno." : "Obrigado! Se ainda tiver dúvida, fale com o suporte no fim da página."}
      </p>
    );
  }
  const btn = "flex h-10 items-center gap-2 rounded-full border border-[#d6d6dc] px-4 text-sm font-medium hover:border-[#ff3916] hover:text-[#ff3916]";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-medium text-[#1f1f28]">Este artigo foi útil?</p>
      <button type="button" onClick={() => setVote("sim")} className={btn}>
        <ThumbsUp className="size-4" /> Sim
      </button>
      <button type="button" onClick={() => setVote("nao")} className={btn}>
        <ThumbsDown className="size-4" /> Não
      </button>
    </div>
  );
}
