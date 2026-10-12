"use client";

import { ChevronRight, Heart, House, Menu, Search, Tag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { ResolvedSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

import { SocialLinks } from "./social-links";

type Props = { tenantName: string; whatsapp: string | null; settings: ResolvedSettings };

/**
 * Barra de abas do celular, como num app nativo. Some na página do veículo, onde a barra
 * de contato ocupa o rodapé.
 */
export function MobileTabBar({ tenantName, whatsapp, settings }: Props) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [pathname]);

  if (pathname.startsWith("/veiculo/")) return null;

  const wa = (text: string) => (whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}` : null);
  const sell = wa("Olá! Quero vender meu carro.");
  const tabs = [
    { href: "/", label: "Início", icon: House, active: pathname === "/" },
    { href: "/estoque", label: "Buscar", icon: Search, active: pathname.startsWith("/estoque") },
    { href: "/favoritos", label: "Favoritos", icon: Heart, active: pathname.startsWith("/favoritos") },
  ];
  const links: [string, string | null][] = [
    ["Carros seminovos", "/estoque"],
    ["Carros 0 km", "/estoque?kmMax=100"],
    ["Motos", "/estoque?tipo=motos"],
    ["Mais recentes", "/estoque?ordem=recentes"],
    ["Simular financiamento", wa("Olá! Quero simular um financiamento.")],
    ["Vender meu carro", sell],
    ["Nossas lojas", "/#lojas"],
    ["Falar com a loja", wa(settings.whatsappMessage)],
  ];
  const tab = "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition active:scale-95";

  return (
    <>
      {menu && (
        <div className="fixed inset-0 z-[60] bg-black/40 md:hidden" onClick={() => setMenu(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-[calc(84px+env(safe-area-inset-bottom))] pt-3 animate-in slide-in-from-bottom duration-300"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#d6d6dc]" />
            <div className="mb-2 flex items-center justify-between">
              <p className="font-heading text-lg font-bold">{tenantName}</p>
              <button type="button" onClick={() => setMenu(false)} aria-label="Fechar menu" className="grid size-9 place-items-center rounded-full bg-[#f2f2f4]">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col">
              {links
                .filter(([, href]) => href)
                .map(([label, href]) => {
                  const external = href!.startsWith("http");
                  return (
                    <a
                      key={label}
                      href={href!}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex h-14 items-center justify-between border-b border-[#f0f0f3] text-[15px] font-medium text-[#1f1f28] active:bg-[#f7f7f9]"
                    >
                      {label} <ChevronRight className="size-5 text-[#9a9aa5]" />
                    </a>
                  );
                })}
            </nav>
            <SocialLinks settings={settings} whatsapp={whatsapp} className="mt-5 [&_a]:bg-[#f2f2f4]" />
          </div>
        </div>
      )}

      <nav data-tour="site-abas" className="fixed inset-x-0 bottom-0 z-[61] flex h-[calc(64px+env(safe-area-inset-bottom))] border-t border-[#ececf0] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {tabs.map(({ href, label, icon: Icon, active }) => (
          <Link key={href} href={href} className={cn(tab, active && !menu ? "text-primary" : "text-[#4a4a55]")}>
            <Icon className={cn("size-6", active && !menu && href === "/favoritos" && "fill-primary")} strokeWidth={active && !menu ? 2.4 : 1.8} />
            {label}
          </Link>
        ))}
        {sell && (
          <a href={sell} target="_blank" rel="noopener noreferrer" className={cn(tab, "text-[#4a4a55]")}>
            <Tag className="size-6" strokeWidth={1.8} />
            Vender
          </a>
        )}
        <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} className={cn(tab, menu ? "text-primary" : "text-[#4a4a55]")}>
          <Menu className="size-6" strokeWidth={menu ? 2.4 : 1.8} />
          Menu
        </button>
      </nav>
    </>
  );
}
