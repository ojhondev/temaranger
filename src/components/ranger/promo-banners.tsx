import Link from "next/link";

import { CarImage } from "@/components/car-image";

function Promo({
  heading,
  title,
  subtitle,
  cta,
  href,
  bg,
  car,
}: {
  heading: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  bg: string;
  car: { color: string; body: string };
}) {
  return (
    <div>
      <h3 className="text-base font-bold text-[#1f1f1f]">{heading}</h3>
      <Link href={href} className={`group relative mt-3 flex h-[196px] items-center overflow-hidden rounded-lg ${bg}`}>
        <div className="relative z-10 pl-9">
          <p className="font-heading text-[26px] font-semibold leading-tight text-white sm:text-[30px]">{title}</p>
          <p className="mt-1 text-base font-semibold text-white/95 sm:text-lg">{subtitle}</p>
          <span className="mt-4 inline-block rounded-full bg-white px-6 py-2 text-base font-semibold text-[#3d3d47] transition group-hover:bg-[#f5f6f7]">
            {cta}
          </span>
        </div>
        <CarImage bare color={car.color} body={car.body} className="absolute -right-6 bottom-0 hidden w-[52%] sm:flex" />
      </Link>
    </div>
  );
}

export function PromoBanners({ whatsapp }: { whatsapp: string | null }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Promo
        heading="Vai comprar ou vender?"
        title="Preços pela Tabela FIPE"
        subtitle="Confira para negociar"
        cta="Ver agora"
        href="/estoque?ordem=menor-preco"
        bg="bg-[linear-gradient(105deg,#1d2633_0%,#3c5469_55%,#9fb7c4_100%)]"
        car={{ color: "Cinza", body: "Picape" }}
      />
      <Promo
        heading="Financie com a gente"
        title="Você de carro novo"
        subtitle="Parcelas que cabem no bolso"
        cta="Simular financiamento"
        href={whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent("Olá! Quero simular um financiamento.")}` : "/estoque"}
        bg="bg-[linear-gradient(105deg,#241b2b_0%,#4b3651_55%,#b79aa8_100%)]"
        car={{ color: "Branco", body: "SUV" }}
      />
    </section>
  );
}
