import Link from "next/link";
import { Bell, CarFront, Heart, LayoutGrid, MessageCircle, Search, Sparkles, Bike, BadgePercent } from "lucide-react";

import type { Tenant } from "@/db/schema";

import { Logo } from "./logo";

/**
 * Header da home e da busca. No celular vira o topo de app: logo + busca numa linha e
 * atalhos em chips roláveis (como a OLX).
 */
export function HeaderHome({ tenant, q, chips = false }: { tenant: Tenant; q?: string; chips?: boolean }) {
  const wa = (text: string) => (tenant.whatsapp ? `https://wa.me/${tenant.whatsapp}?text=${encodeURIComponent(text)}` : null);
  const sellHref = wa("Olá! Quero vender meu carro.") ?? "/estoque";
  const financing = wa("Olá! Quero simular um financiamento.");

  const CHIPS = [
    { href: "/estoque", label: "Carros", icon: CarFront },
    { href: "/estoque?tipo=motos", label: "Motos", icon: Bike },
    { href: "/favoritos", label: "Favoritos", icon: Heart },
    { href: "/estoque?kmMax=100", label: "0 km", icon: Sparkles },
    ...(financing ? [{ href: financing, label: "Financiar", icon: BadgePercent }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:h-[72px] sm:gap-4 sm:px-6 lg:gap-6 lg:px-10 2xl:px-14">
        <Logo tenant={tenant} />

        <form action="/estoque" role="search" data-tour="site-busca" className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-[#f2f2f4] pl-4 pr-1.5 lg:max-w-[520px]">
          <input
            name="q"
            defaultValue={q}
            placeholder='Buscar "Carro"'
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#8a8a94] sm:text-sm"
          />
          <button className="grid size-8 place-items-center rounded-full hover:bg-white" aria-label="Buscar">
            <Search className="size-[18px]" />
          </button>
        </form>

        <nav className="ml-auto hidden items-center gap-6 text-[13px] font-semibold text-[#1f1f1f] xl:flex">
          <Link href="/estoque" className="flex items-center gap-1.5 hover:text-primary">
            <CarFront className="size-[18px]" /> Seminovos
          </Link>
          <Link href="/estoque?tipo=motos" className="flex items-center gap-1.5 hover:text-primary">
            <LayoutGrid className="size-[18px]" /> Motos
          </Link>
          {tenant.whatsapp && (
            <a
              href={`https://wa.me/${tenant.whatsapp}?text=${encodeURIComponent(tenant.settings?.whatsappMessage || "Olá! Vim pelo site.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary"
            >
              <MessageCircle className="size-[18px]" /> Chat
            </a>
          )}
          <Link href="/estoque?ordem=recentes" className="flex items-center gap-1.5 hover:text-primary">
            <Bell className="size-[18px]" /> Novidades
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex xl:ml-0">
          <Link href="/favoritos" aria-label="Favoritos" className="grid size-11 place-items-center rounded-full hover:bg-[#f2f2f4]">
            <Heart className="size-5" />
          </Link>
          <a
            href={sellHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center rounded-full bg-primary px-7 text-[13px] font-bold text-white hover:brightness-95"
          >
            Quero vender
          </a>
        </div>
      </div>

      {chips && (
        <nav data-tour="site-chips" className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-none md:hidden" aria-label="Atalhos">
          {CHIPS.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#e2e2e8] px-4 text-sm font-medium text-[#2e2e38] active:scale-95 active:bg-[#f2f2f4]"
            >
              <Icon className="size-[18px] text-primary" /> {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
