import Link from "next/link";
import { Bell, CarFront, ChevronDown, LayoutGrid, MapPin, MessageCircle, Search } from "lucide-react";

import type { Tenant } from "@/db/schema";

import { Logo } from "./logo";

/** Header da home e da busca: logo, busca com localização, atalhos e CTAs. */
export function HeaderHome({ tenant, q }: { tenant: Tenant; q?: string }) {
  const sellHref = tenant.whatsapp
    ? `https://wa.me/${tenant.whatsapp}?text=${encodeURIComponent("Olá! Quero vender meu carro.")}`
    : "/estoque";

  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-white/95 backdrop-blur">
      <div className="flex h-[72px] items-center gap-4 px-4 sm:px-6 lg:gap-6 lg:px-10 2xl:px-14">
        <Logo tenant={tenant} />

        <form
          action="/estoque"
          className="hidden h-11 min-w-0 flex-1 items-center rounded-full bg-[#f2f2f4] pl-4 pr-1.5 md:flex lg:max-w-[520px]"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder='Buscar "Carro"'
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a8a94]"
          />
          <span className="mx-3 h-6 w-px bg-[#d6d6dc]" />
          <span className="flex items-center gap-1 text-xs font-semibold text-[#3d3d47]">
            <MapPin className="size-4" /> SP <ChevronDown className="size-4" />
          </span>
          <button className="ml-2 grid size-8 place-items-center rounded-full hover:bg-white" aria-label="Buscar">
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

        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <Link
            href="/torque"
            className="hidden h-11 items-center rounded-full border border-[#d6d6dc] px-8 text-[13px] font-semibold hover:bg-[#f7f7f9] sm:flex"
          >
            Entrar
          </Link>
          <a
            href={sellHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center rounded-full bg-primary px-5 text-[13px] font-bold text-white hover:brightness-95 sm:px-7"
          >
            Quero vender
          </a>
        </div>
      </div>
      <form action="/estoque" className="px-4 pb-3 md:hidden">
        <div className="flex h-11 items-center rounded-full bg-[#f2f2f4] pl-4 pr-1.5">
          <input
            name="q"
            defaultValue={q}
            placeholder='Buscar "Carro"'
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button className="grid size-8 place-items-center" aria-label="Buscar">
            <Search className="size-[18px]" />
          </button>
        </div>
      </form>
    </header>
  );
}
