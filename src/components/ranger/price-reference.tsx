import { ExternalLink } from "lucide-react";

import { brl } from "@/lib/format";
import type { ResolvedSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

/**
 * Card "Referência de preço" abaixo do preço: imagem/selo enviado pela loja, texto livre e,
 * se o carro tem FIPE cadastrada, a comparação automática com a tabela.
 */
export function PriceReference({ cfg, price, fipe, className }: { cfg: ResolvedSettings["priceReference"]; price: number; fipe: number | null; className?: string }) {
  const showFipe = cfg.showFipe && !!fipe;
  if (!cfg.enabled || (!cfg.imageUrl && !cfg.text && !showFipe)) return null;

  const diff = fipe ? (price - fipe) / fipe : 0;
  const below = diff < 0;
  // Posição do preço na régua: 0% = 20% abaixo da FIPE, 100% = 20% acima.
  const pos = Math.min(100, Math.max(0, 50 + (diff / 0.2) * 50));

  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="font-heading text-[15px] font-bold text-[#1f1f28]">{cfg.title}</p>
        {cfg.href && <ExternalLink className="size-4 text-[#6b6b76]" />}
      </div>
      {cfg.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cfg.imageUrl} alt={cfg.title} className="mt-3 max-h-40 w-full rounded-lg object-contain" />
      )}
      {showFipe && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-[#6b6b76]">Tabela FIPE</span>
            <span className="font-semibold text-[#2e2e38]">{brl(fipe!)}</span>
          </div>
          <div className="relative mt-3 h-2 rounded-full bg-gradient-to-r from-[#1faa53] via-[#f5c518] to-[#e5484d]">
            <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-[#1f1f28] shadow" style={{ left: `${pos}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-[#9a9aa5]">
            <span>Abaixo</span>
            <span>Na média</span>
            <span>Acima</span>
          </div>
          <p className={cn("mt-3 rounded-lg px-3 py-2 text-sm font-semibold", below ? "bg-[#e9f8ee] text-[#1c7a3c]" : "bg-[#f5f6f7] text-[#3d3d47]")}>
            {Math.abs(diff) < 0.01
              ? "Preço alinhado com a FIPE"
              : `${Math.round(Math.abs(diff) * 100)}% ${below ? "abaixo" : "acima"} da FIPE (${brl(Math.abs(price - fipe!))})`}
          </p>
        </div>
      )}
      {cfg.text && <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-[#6b6b76]">{cfg.text}</p>}
    </>
  );

  const box = cn("block rounded-2xl border border-[#e2e2e8] bg-white p-5", className);
  return cfg.href ? (
    <a href={cfg.href} target="_blank" rel="noopener noreferrer" className={cn(box, "transition hover:border-[#b9b9c4]")}>
      {body}
    </a>
  ) : (
    <div className={box}>{body}</div>
  );
}
