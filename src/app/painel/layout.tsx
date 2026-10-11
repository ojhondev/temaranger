import Link from "next/link";
import { Car, ExternalLink, Inbox, LayoutDashboard, Users } from "lucide-react";

import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";
export const metadata = { title: "Painel", robots: { index: false } };

const NAV = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { href: "/painel/estoque", label: "Estoque", icon: Car },
  { href: "/painel/leads", label: "Leads", icon: Inbox },
  { href: "/painel/vendedores", label: "Vendedores", icon: Users },
];

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  return (
    <div
      className="flex min-h-dvh flex-col bg-muted/40 md:flex-row"
      style={{ "--primary": tenant.primaryColor, "--primary-foreground": "#fff" } as React.CSSProperties}
    >
      <aside className="flex shrink-0 flex-col gap-1 bg-neutral-950 p-4 text-neutral-300 md:w-60">
        <p className="px-3 pb-4 font-heading text-lg font-extrabold text-white">
          {tenant.name}
          <span className="block text-xs font-medium text-neutral-500">Painel SoftMotors</span>
        </p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-white/10 hover:text-white"
            >
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          target="_blank"
          className="mt-auto hidden items-center gap-2 px-3 py-2 text-xs text-neutral-500 hover:text-white md:flex"
        >
          <ExternalLink className="size-3.5" /> Ver site
        </Link>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
