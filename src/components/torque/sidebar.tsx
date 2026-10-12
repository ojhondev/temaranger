"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CarFront,
  ChevronRight,
  CircleHelp,
  Globe,
  House,
  Menu,
  MessagesSquare,
  Pin,
  PinOff,
  Store,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { TorqueLogo } from "./brand";
import { useTour } from "./tour";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: { href: string; label: string; managerOnly?: boolean }[];
  managerOnly?: boolean;
  masterOnly?: boolean;
};

const MAIN: Item[] = [
  { href: "/torque", label: "Início", icon: House },
  {
    href: "/torque/crm",
    label: "CRM",
    icon: MessagesSquare,
    children: [
      { href: "/torque/crm", label: "Painel" },
      { href: "/torque/crm/leads", label: "Leads" },
      { href: "/torque/crm/novo", label: "Criar lead" },
    ],
  },
  {
    href: "/torque/estoque",
    label: "Estoque",
    icon: CarFront,
    children: [
      { href: "/torque/estoque", label: "Veículos" },
      { href: "/torque/estoque/novo", label: "Cadastrar veículo", managerOnly: true },
    ],
  },
  { href: "/torque/marketplaces", label: "Marketplaces", icon: Store, badge: "NOVO", managerOnly: true },
  {
    href: "/torque/site",
    label: "Site",
    icon: Globe,
    managerOnly: true,
    children: [
      { href: "/torque/site", label: "Identidade" },
      { href: "/torque/site/banners", label: "Banners" },
      { href: "/torque/site/inicio", label: "Página inicial" },
      { href: "/torque/site/contato", label: "Contato e WhatsApp" },
      { href: "/torque/site/lojas", label: "Lojas" },
      { href: "/torque/site/dominio", label: "Domínio" },
    ],
  },
  { href: "/torque/equipe", label: "Equipe", icon: Users, managerOnly: true },
  { href: "/torque/clientes", label: "Clientes", icon: Building2, badge: "MASTER", masterOnly: true },
];

const KEY = "torque:menu-fixo";

export function Sidebar({ isManager, isMaster = false }: { isManager: boolean; isMaster?: boolean }) {
  const pathname = usePathname();
  const { openHelp, startTour } = useTour();
  const [pinned, setPinned] = useState(true);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    try {
      setPinned(localStorage.getItem(KEY) !== "0");
    } catch {}
  }, []);

  const expanded = pinned || hover;
  const isActive = (href: string) => (href === "/torque" ? pathname === href : pathname.startsWith(href));
  const items = MAIN.filter((i) => (isManager || !i.managerOnly) && (isMaster || !i.masterOnly));

  function togglePin() {
    const next = !pinned;
    setPinned(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
  }

  const row = "flex h-10 w-full items-center gap-3 rounded-md px-3 text-[13.5px] transition";

  return (
    <aside
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "sticky top-0 z-40 hidden h-dvh shrink-0 flex-col bg-[#2a2a33] text-[#d2d2da] transition-[width] duration-200 md:flex",
        expanded ? "w-[232px]" : "w-[64px]",
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/torque">
          <TorqueLogo collapsed={!expanded} />
        </Link>
        {expanded && (
          <button
            type="button"
            onClick={togglePin}
            aria-label={pinned ? "Recolher menu" : "Fixar menu aberto"}
            className="grid size-7 place-items-center rounded text-[#9a9aa6] hover:text-white"
          >
            {pinned ? <Pin className="size-4" /> : <PinOff className="size-4" />}
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pt-2">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const showChildren = expanded && item.children && (open === item.href || (open === null && active));
          return (
            <div key={item.href} data-tour={`nav:${item.href}`}>
              <div className="relative">
                {active && <span className="absolute inset-y-1.5 -left-2 w-[3px] rounded-r bg-primary" />}
                {item.children ? (
                  <button
                    type="button"
                    onClick={() => setOpen(showChildren ? "" : item.href)}
                    className={cn(row, active ? "bg-white/[0.07] text-white" : "hover:bg-white/[0.05] hover:text-white")}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {expanded && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight className={cn("size-4 transition", showChildren && "rotate-90")} />
                      </>
                    )}
                  </button>
                ) : (
                  <Link href={item.href} className={cn(row, active ? "bg-white/[0.07] text-white" : "hover:bg-white/[0.05] hover:text-white")}>
                    <Icon className="size-[18px] shrink-0" />
                    {expanded && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded bg-[#6e3ff2] px-1.5 py-0.5 text-[9px] font-bold leading-none text-white">{item.badge}</span>
                        )}
                      </>
                    )}
                  </Link>
                )}
              </div>
              {showChildren && (
                <div className="my-1 ml-[22px] flex flex-col border-l border-white/10 pl-3">
                  {item.children!.filter((c) => isManager || !c.managerOnly).map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={cn(
                        "rounded px-2 py-1.5 text-[13px] hover:text-white",
                        pathname === c.href ? "font-semibold text-white" : "text-[#a9a9b4]",
                      )}
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-white/10 px-2 py-3">
        <Link href="/torque/conta" className={cn(row, isActive("/torque/conta") ? "text-white" : "hover:text-white")}>
          <UserCog className="size-[18px] shrink-0" />
          {expanded && "Conta"}
        </Link>
        <button type="button" onClick={openHelp} data-tour="ajuda" className={cn(row, "hover:text-white")}>
          <CircleHelp className="size-[18px] shrink-0" />
          {expanded && "Central de ajuda"}
        </button>
        <button
          type="button"
          onClick={() => startTour("boas-vindas")}
          className={cn(
            "mt-2 flex h-9 items-center gap-2 rounded-full bg-primary px-3 text-[13px] font-semibold text-white hover:brightness-110",
            expanded ? "w-fit" : "w-10 justify-center px-0",
          )}
        >
          <span className="grid size-5 place-items-center rounded-full bg-white text-[11px] font-bold text-primary">?</span>
          {expanded && "Posso ajudar?"}
        </button>
      </div>
    </aside>
  );
}

/** Menu do celular: 4 módulos na barra inferior e o resto em "Mais". */
export function MobileNav({ isManager, isMaster = false }: { isManager: boolean; isMaster?: boolean }) {
  const pathname = usePathname();
  const { openHelp } = useTour();
  const [more, setMore] = useState(false);
  const all = MAIN.filter((i) => (isManager || !i.managerOnly) && (isMaster || !i.masterOnly));
  const bar = all.slice(0, 4);
  const rest = all.slice(4);
  const isActive = (href: string) => (href === "/torque" ? pathname === href : pathname.startsWith(href));

  useEffect(() => setMore(false), [pathname]);

  const tab = "flex flex-1 flex-col items-center gap-0.5 px-1 text-[10px]";
  return (
    <>
      {more && <button type="button" aria-label="Fechar menu" onClick={() => setMore(false)} className="fixed inset-0 z-40 bg-black/40 md:hidden" />}
      {more && (
        <div className="fixed inset-x-0 bottom-[58px] z-50 max-h-[70dvh] overflow-y-auto rounded-t-2xl bg-[#2a2a33] p-3 text-[#d2d2da] md:hidden">
          {rest.map((item) => (
            <div key={item.href} className="border-b border-white/10 py-1 last:border-0">
              <Link href={item.href} className={cn("flex h-11 items-center gap-3 px-2 text-sm", isActive(item.href) && "text-white")}>
                <item.icon className={cn("size-5", isActive(item.href) && "text-primary")} />
                <span className="flex-1">{item.label}</span>
                {item.badge && <span className="rounded bg-[#6e3ff2] px-1.5 py-0.5 text-[9px] font-bold text-white">{item.badge}</span>}
              </Link>
              {item.children && (
                <div className="flex flex-wrap gap-1.5 px-2 pb-2 pl-10">
                  {item.children
                    .filter((c) => isManager || !c.managerOnly)
                    .map((c) => (
                      <Link key={c.href} href={c.href} className={cn("rounded-full bg-white/[0.06] px-3 py-1.5 text-xs", pathname === c.href && "bg-primary text-white")}>
                        {c.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          ))}
          <Link href="/torque/conta" className="flex h-11 items-center gap-3 px-2 text-sm">
            <UserCog className="size-5" /> Conta
          </Link>
          <button type="button" onClick={() => (setMore(false), openHelp())} className="flex h-11 w-full items-center gap-3 px-2 text-sm">
            <CircleHelp className="size-5" /> Central de ajuda
          </button>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex h-[58px] items-center border-t border-white/10 bg-[#2a2a33] md:hidden">
        {bar.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn(tab, isActive(href) ? "text-white" : "text-[#a9a9b4]")}>
            <Icon className={cn("size-5", isActive(href) && "text-primary")} />
            {label}
          </Link>
        ))}
        <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} className={cn(tab, more ? "text-white" : "text-[#a9a9b4]")}>
          <Menu className={cn("size-5", more && "text-primary")} />
          Mais
        </button>
      </nav>
    </>
  );
}
