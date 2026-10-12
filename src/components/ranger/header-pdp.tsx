import Link from "next/link";
import { ChevronDown, User } from "lucide-react";

import type { Tenant } from "@/db/schema";

import { FavoriteButton } from "./favorite-button";
import { Logo } from "./logo";
import { BackButton, ShareButton } from "./share-button";

/** Header da página do veículo: menus suspensos. */
export function HeaderPdp({ tenant, vehicle }: { tenant: Tenant; vehicle?: { id: number; title: string } }) {
  const wa = (text: string) =>
    tenant.whatsapp ? `https://wa.me/${tenant.whatsapp}?text=${encodeURIComponent(text)}` : "/estoque";

  const MENUS: { label: string; items: { label: string; href: string }[] }[] = [
    {
      label: "Comprar",
      items: [
        { label: "Carros seminovos", href: "/estoque" },
        { label: "Carros 0 km", href: "/estoque?kmMax=100" },
        { label: "Motos", href: "/estoque?tipo=motos" },
      ],
    },
    { label: "Vender", items: [{ label: "Vender meu carro", href: wa("Olá! Quero vender meu carro.") }] },
    { label: "Financiar", items: [{ label: "Simular financiamento", href: wa("Olá! Quero simular um financiamento.") }] },
    { label: "Cuidar", items: [{ label: "Agendar revisão", href: wa("Olá! Quero agendar uma revisão.") }] },
    { label: "Lojas", items: [{ label: "Nossas lojas", href: "/#lojas" }] },
    {
      label: "Descobrir",
      items: [
        { label: "Mais vendidos", href: "/estoque?ordem=recentes" },
        { label: "Abaixo da FIPE", href: "/estoque?ordem=menor-preco" },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      {vehicle && (
        <div className="flex h-14 items-center gap-1 px-2 lg:hidden">
          <BackButton />
          <Logo tenant={tenant} className="ml-1 [&_img]:h-7" />
          <div className="ml-auto flex items-center">
            <FavoriteButton id={vehicle.id} plain className="size-10" />
            <ShareButton title={vehicle.title} />
          </div>
        </div>
      )}
      <div className={vehicle ? "hidden h-[88px] items-center gap-8 px-4 sm:px-6 lg:flex lg:px-10 2xl:px-14" : "flex h-[88px] items-center gap-8 px-4 sm:px-6 lg:px-10 2xl:px-14"}>
        <Logo tenant={tenant} className="[&_img]:h-9 sm:[&_img]:h-10" />
        <nav className="hidden flex-1 items-center justify-center gap-[clamp(1.5rem,4vw,4rem)] font-heading text-[17px] text-[#2e2e38] lg:flex">
          {MENUS.map((m) => (
            <div key={m.label} className="group relative">
              <button className="flex items-center gap-2 py-6 hover:text-primary">
                {m.label} <ChevronDown className="size-4 transition group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 min-w-56 -translate-x-1/2 rounded-xl border bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                {m.items.map((i) => (
                  <Link key={i.label} href={i.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-[#f5f6f7]">
                    {i.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <Link href="/torque" className="ml-auto flex items-center gap-3 font-heading text-[15px] text-[#2e2e38] lg:ml-0">
          <span className="grid size-8 place-items-center rounded-full bg-[#ececf2]">
            <User className="size-4" />
          </span>
          Entrar
        </Link>
      </div>
    </header>
  );
}
