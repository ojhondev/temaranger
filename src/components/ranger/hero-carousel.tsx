"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { CarImage } from "@/components/car-image";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: number;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  href: string | null;
  imageUrl: string | null;
};

/** Visual padrão quando a loja ainda não subiu imagem para o banner. */
const FALLBACK = [
  { bg: "bg-[linear-gradient(100deg,#2b2f36_0%,#4a5059_45%,#8a919b_100%)]", body: "SUV", color: "Preto" },
  { bg: "bg-[linear-gradient(100deg,#1f2a37_0%,#3c4b5c_50%,#97a6b5_100%)]", body: "Picape", color: "Prata" },
  { bg: "bg-[linear-gradient(100deg,#2a1d2e_0%,#5b2d3c_50%,#c9767a_100%)]", body: "Hatch", color: "Vermelho" },
  { bg: "bg-[linear-gradient(100deg,#111827_0%,#1f2f4a_50%,#4f6d96_100%)]", body: "Sedã", color: "Branco" },
];

/** Banner rotativo do topo da home (editável no Torque > Site > Banners). */
export function HeroCarousel({ banners }: { banners: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const n = banners.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n, i]);

  if (!n) return null;

  const arrow =
    "absolute top-1/2 z-10 hidden size-[52px] -translate-y-1/2 place-items-center rounded-full border border-[#1f1f1f] bg-white text-[#1f1f1f] transition hover:bg-[#f5f6f7] md:grid";

  return (
    <div className="relative md:mx-7">
      <div className="relative overflow-hidden rounded-xl">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {banners.map((b, k) => {
            const fb = FALLBACK[k % FALLBACK.length];
            return (
              <div
                key={b.id}
                className={cn("relative flex h-[200px] w-full shrink-0 items-center sm:h-[260px] 2xl:h-[320px]", !b.imageUrl && fb.bg)}
                aria-hidden={k !== i}
              >
                {b.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.imageUrl} alt="" className="absolute inset-0 size-full object-cover" loading={k === 0 ? "eager" : "lazy"} />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.55)_0%,rgba(0,0,0,.15)_55%,rgba(0,0,0,0)_100%)]" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,.35)_100%)]" />
                    <div className="absolute bottom-[14%] right-[6%] hidden h-1 w-[30%] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.7)_0_28px,transparent_28px_56px)] sm:block" />
                    <CarImage bare color={fb.color} body={fb.body} className="absolute bottom-[4%] right-[24%] hidden w-[34%] lg:flex" />
                  </>
                )}
                <div className="relative z-10 w-[62%] pl-6 sm:w-[48%] sm:pl-[5.5%]">
                  <h2 className="font-heading text-xl font-semibold leading-[1.15] text-white drop-shadow sm:text-[40px]">{b.title}</h2>
                  {b.subtitle && <p className="mt-2 text-sm text-white/90 drop-shadow sm:mt-4 sm:text-xl">{b.subtitle}</p>}
                </div>
                {b.ctaLabel && b.href && (
                  <Link
                    href={b.href}
                    tabIndex={k === i ? 0 : -1}
                    className="absolute bottom-9 right-4 z-10 rounded-full bg-ranger-lime px-5 py-2 text-sm font-bold text-ranger-lime-ink shadow-lg transition hover:brightness-95 sm:bottom-auto sm:right-[10%] sm:top-[40%] sm:px-11 sm:py-3 sm:text-lg"
                  >
                    {b.ctaLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        {n > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1 sm:bottom-6">
            {banners.map((b, k) => (
              <button
                key={b.id}
                type="button"
                aria-label={`Banner ${k + 1}`}
                onClick={() => setI(k)}
                className={cn("h-1 w-10 rounded-full transition", k === i ? "bg-primary" : "bg-white")}
              />
            ))}
          </div>
        )}
      </div>
      {n > 1 && (
        <>
          <button type="button" aria-label="Banner anterior" onClick={() => setI((i - 1 + n) % n)} className={cn(arrow, "-left-7")}>
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" aria-label="Próximo banner" onClick={() => setI((i + 1) % n)} className={cn(arrow, "-right-7")}>
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
