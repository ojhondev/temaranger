"use client";

import Link from "next/link";
import { Bell, ExternalLink, LogOut, MessageSquare, Store, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { logout } from "@/app/torque/actions/auth";
import { TorqueLogo } from "@/components/torque/brand";

export type Alert = { label: string; href: string; tone: "red" | "blue" };

export function Topbar({
  userName,
  role,
  tenantName,
  newLeads,
  alerts,
}: {
  userName: string;
  role: string;
  tenantName: string;
  newLeads: number;
  alerts: Alert[];
}) {
  const [menu, setMenu] = useState<"user" | "bell" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(null);
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const initial = userName.trim().charAt(0).toUpperCase();
  const dot = "absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-white";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#ececf1] bg-white px-4 md:px-8">
      <span className="md:hidden">
        <span className="rounded-md bg-[#2a2a33] px-2 py-1.5 inline-flex">
          <TorqueLogo />
        </span>
      </span>
      <div ref={ref} className="ml-auto flex items-center gap-2 sm:gap-4">
        <a
          href="/"
          target="_blank"
          className="hidden h-10 items-center gap-2 rounded-md border border-[#2a2a33] px-4 text-[13px] font-semibold text-[#2a2a33] hover:bg-[#f5f5f7] sm:flex"
        >
          Acessar meu site <ExternalLink className="size-4" />
        </a>
        <span className="hidden h-8 w-px bg-[#e2e2e8] sm:block" />
        <Link href="/torque/crm/leads?status=new" className="relative grid size-9 place-items-center rounded-full hover:bg-[#f5f5f7]" aria-label="Leads novos">
          <MessageSquare className="size-5 text-[#2a2a33]" />
          {newLeads > 0 && <span className={dot}>{newLeads > 99 ? "99+" : newLeads}</span>}
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu(menu === "bell" ? null : "bell")}
            className="relative grid size-9 place-items-center rounded-full hover:bg-[#f5f5f7]"
            aria-label="Avisos"
          >
            <Bell className="size-5 text-[#2a2a33]" />
            {alerts.length > 0 && <span className={dot}>{alerts.length}</span>}
          </button>
          {menu === "bell" && (
            <div className="absolute right-0 top-11 w-80 rounded-xl border bg-white p-2 shadow-xl">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#6b6b76]">Avisos</p>
              {alerts.length === 0 && <p className="px-3 pb-3 text-sm text-[#6b6b76]">Tudo em dia por aqui.</p>}
              {alerts.map((a) => (
                <Link key={a.label} href={a.href} onClick={() => setMenu(null)} className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[#f5f5f7]">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${a.tone === "red" ? "bg-primary" : "bg-sky-500"}`} />
                  {a.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenu(menu === "user" ? null : "user")}
            className="grid size-9 place-items-center rounded-full bg-[#d9d9e0] text-sm font-semibold text-[#2a2a33]"
            aria-label="Menu da conta"
          >
            {initial}
          </button>
          {menu === "user" && (
            <div className="absolute right-0 top-11 w-64 rounded-xl border bg-white p-2 shadow-xl">
              <div className="flex items-center gap-3 border-b px-3 pb-3 pt-2">
                <span className="grid size-11 place-items-center rounded-full bg-[#d9d9e0] text-lg font-semibold">{initial}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{userName}</p>
                  <p className="truncate text-xs text-[#6b6b76]">
                    {role} · {tenantName}
                  </p>
                </div>
              </div>
              <Link href="/torque/conta" onClick={() => setMenu(null)} className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#f5f5f7]">
                <UserRound className="size-4" /> Meu perfil
              </Link>
              <Link href="/torque/site" onClick={() => setMenu(null)} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#f5f5f7]">
                <Store className="size-4" /> Dados da loja
              </Link>
              <form action={logout}>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-[#f5f5f7]">
                  <LogOut className="size-4" /> Sair
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
