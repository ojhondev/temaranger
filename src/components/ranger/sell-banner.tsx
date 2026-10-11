import { Check } from "lucide-react";

import { CarImage } from "@/components/car-image";

/** Faixa vermelha "venda seu usado" (textos editáveis no Torque > Site > Página inicial). */
export function SellBanner({
  whatsapp,
  title,
  subtitle,
  cta,
}: {
  whatsapp: string | null;
  title: string;
  subtitle: string;
  cta: string;
}) {
  const href = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá! Quero vender meu carro.")}`
    : "/estoque";

  return (
    <section className="relative overflow-hidden rounded-xl bg-primary">
      {/* faixas decorativas laterais */}
      <div className="pointer-events-none absolute inset-y-0 left-6 hidden w-16 md:block border-x-[6px] border-white/80 sm:left-8" />
      <div className="pointer-events-none absolute inset-y-0 right-6 hidden w-16 md:block border-x-[6px] border-white/80 sm:right-8" />

      <div className="relative grid items-center gap-6 px-6 py-8 md:px-24 md:grid-cols-[1fr_auto_1fr] md:py-0">
        <p className="max-w-[16ch] text-balance text-center font-heading text-xl font-medium leading-snug text-white/95 md:text-left md:text-2xl">
          {title}
        </p>

        {/* celular com o anúncio publicado */}
        <div className="relative mx-auto hidden h-[214px] w-[160px] md:block">
          <div className="absolute inset-x-0 top-4 h-[230px] rounded-[26px] border-[6px] border-[#141414] bg-white px-2.5 pt-6 shadow-2xl">
            <div className="absolute left-1/2 top-1.5 h-2.5 w-14 -translate-x-1/2 rounded-full bg-[#141414]" />
            <CarImage color="Vermelho" body="SUV" className="rounded-md" />
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-3/4 rounded bg-[#e2e2e8]" />
              <div className="h-1.5 w-1/2 rounded bg-[#e2e2e8]" />
            </div>
            <p className="mt-2 flex items-center justify-center gap-1 rounded bg-[#1c9b4a] py-1 text-[9px] font-bold text-white">
              Anunciado <Check className="size-3" />
            </p>
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="max-w-[22ch] text-balance font-heading text-xl font-medium leading-snug text-white md:text-2xl">{subtitle}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-md bg-[#2b2b33] px-5 py-3 text-base font-semibold text-white transition hover:bg-black"
          >
            {cta}
          </a>
        </div>
      </div>
    </section>
  );
}
