import type { Marketplace } from "@/db/schema";
import { cn } from "@/lib/utils";

/** Marca simplificada de cada portal (bloco de cor + nome), sem usar o logotipo oficial. */
export function PortalLogo({ mp, className }: { mp: Marketplace; className?: string }) {
  const map = {
    olx: { bg: "bg-[#6e0ad6]", fg: "text-white", label: "OLX" },
    webmotors: { bg: "bg-[#e1173f]", fg: "text-white", label: "webmotors" },
    mercadolivre: { bg: "bg-[#ffe600]", fg: "text-[#2d3277]", label: "mercado livre" },
  }[mp];
  return (
    <span className={cn("grid place-items-center rounded-xl px-3 font-heading font-bold tracking-tight", map.bg, map.fg, className)}>
      {map.label}
    </span>
  );
}
