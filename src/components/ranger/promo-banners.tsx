import Link from "next/link";

import { CarImage } from "@/components/car-image";

export type PromoItem = {
  id: number;
  heading: string | null;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  href: string | null;
  imageUrl: string | null;
};

const FALLBACK_BG = [
  { bg: "bg-[linear-gradient(105deg,#1d2633_0%,#3c5469_55%,#9fb7c4_100%)]", car: { color: "Cinza", body: "Picape" } },
  { bg: "bg-[linear-gradient(105deg,#241b2b_0%,#4b3651_55%,#b79aa8_100%)]", car: { color: "Branco", body: "SUV" } },
];

function Promo({ item, index }: { item: PromoItem; index: number }) {
  const fb = FALLBACK_BG[index % 2];
  const external = item.href?.startsWith("http");
  const inner = (
    <>
      {item.imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.55)_0%,rgba(0,0,0,0)_70%)]" />
        </>
      ) : (
        <CarImage bare color={fb.car.color} body={fb.car.body} className="absolute -right-6 bottom-0 hidden w-[52%] sm:flex" />
      )}
      <div className="relative z-10 pl-9">
        <p className="font-heading text-[26px] font-semibold leading-tight text-white sm:text-[30px]">{item.title}</p>
        {item.subtitle && <p className="mt-1 text-base font-semibold text-white/95 sm:text-lg">{item.subtitle}</p>}
        {item.ctaLabel && (
          <span className="mt-4 inline-block rounded-full bg-white px-6 py-2 text-base font-semibold text-[#3d3d47] transition group-hover:bg-[#f5f6f7]">
            {item.ctaLabel}
          </span>
        )}
      </div>
    </>
  );
  const cls = `group relative mt-3 flex h-[196px] items-center overflow-hidden rounded-lg 2xl:h-[230px] ${item.imageUrl ? "bg-[#2a2a33]" : fb.bg}`;
  return (
    <div>
      {item.heading && <h3 className="text-base font-bold text-[#1f1f1f]">{item.heading}</h3>}
      {external ? (
        <a href={item.href!} target="_blank" rel="noopener noreferrer" className={cls}>
          {inner}
        </a>
      ) : (
        <Link href={item.href ?? "/estoque"} className={cls}>
          {inner}
        </Link>
      )}
    </div>
  );
}

/** Dois banners lado a lado (editáveis no Torque > Site > Banners > promocionais). */
export function PromoBanners({ items, whatsappHref }: { items: PromoItem[]; whatsappHref: string | null }) {
  const list: PromoItem[] = items.length
    ? items.slice(0, 2)
    : [
        { id: -1, heading: "Vai comprar ou vender?", title: "Preços pela Tabela FIPE", subtitle: "Confira para negociar", ctaLabel: "Ver agora", href: "/estoque?ordem=menor-preco", imageUrl: null },
        { id: -2, heading: "Financie com a gente", title: "Você de carro novo", subtitle: "Parcelas que cabem no bolso", ctaLabel: "Simular financiamento", href: whatsappHref ?? "/estoque", imageUrl: null },
      ];
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {list.map((item, i) => (
        <Promo key={item.id} item={item} index={i} />
      ))}
    </section>
  );
}
