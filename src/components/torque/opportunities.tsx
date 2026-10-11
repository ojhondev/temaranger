import Link from "next/link";
import { CarFront, Globe, ImagePlus, Store, Users } from "lucide-react";

import { Rail } from "@/components/ranger/rail";

type Card = {
  mark: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  href: string;
  tone: "red" | "dark";
};

/** Carrossel "Oportunidades de negócio": atalhos para recursos do Torque. */
export function OpportunityRail({ connected }: { connected: string[] }) {
  const cards: Card[] = [
    {
      mark: "marketplaces",
      icon: Store,
      text:
        connected.length < 3
          ? "Conecte OLX, WebMotors e Mercado Livre e anuncie todo o estoque de uma vez."
          : "Seus portais estão conectados. Acompanhe anúncios e leads de cada um.",
      href: "/torque/marketplaces",
      tone: "red",
    },
    { mark: "banners", icon: ImagePlus, text: "Suba um banner de oferta no topo do site em menos de um minuto.", href: "/torque/site/banners", tone: "dark" },
    { mark: "fotos", icon: CarFront, text: "Anúncio com 10+ fotos recebe muito mais contatos. Complete a galeria dos seus carros.", href: "/torque/estoque", tone: "red" },
    { mark: "equipe", icon: Users, text: "Cadastre seus vendedores e deixe o rodízio distribuir os leads sozinho.", href: "/torque/equipe", tone: "dark" },
    { mark: "site", icon: Globe, text: "Ajuste textos da página inicial, WhatsApp e redes sociais do seu site.", href: "/torque/site/inicio", tone: "red" },
  ];

  return (
    <Rail dots arrows="both" className="min-w-0">
      {cards.map((c) => (
        <article key={c.mark} className="flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(16,16,24,.08)]">
          <div className={`relative flex h-[132px] items-center justify-center overflow-hidden ${c.tone === "red" ? "bg-primary" : "bg-[#2a2a33]"}`}>
            <c.icon className="absolute -bottom-6 -right-4 size-32 text-white/10" />
            <span className="flex items-center gap-1.5 font-heading text-2xl font-semibold text-white">
              <c.icon className="size-6" />
              {c.mark}.
            </span>
          </div>
          <p className="flex-1 px-4 pt-4 text-[13px] leading-relaxed text-[#4a4a55]">{c.text}</p>
          <Link href={c.href} className="py-4 text-center text-[13px] font-semibold text-primary hover:underline">
            Confira
          </Link>
        </article>
      ))}
    </Rail>
  );
}
