import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { listStores } from "@/db/queries";
import { getTenant } from "@/lib/tenant";

export async function generateMetadata() {
  const t = await getTenant();
  return { title: { default: `${t.name} | Seminovos`, template: `%s | ${t.name}` } };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  const stores = await listStores(tenant.id);

  return (
    <div
      className="flex min-h-dvh flex-col"
      style={{ "--primary": tenant.primaryColor, "--primary-foreground": "#fff" } as React.CSSProperties}
    >
      <header className="sticky top-0 z-30 bg-neutral-950 text-white">
        <div className="flex h-16 items-center gap-6 px-4 sm:px-8">
          <Link href="/" className="font-heading text-xl font-extrabold tracking-tight">
            {tenant.name}
            <span className="text-primary">.</span>
          </Link>
          <nav className="ml-auto flex items-center gap-5 text-sm font-medium text-neutral-300">
            <Link href="/estoque" className="hover:text-white">
              Estoque
            </Link>
            <Link href="/#lojas" className="hidden hover:text-white sm:block">
              Lojas
            </Link>
            {tenant.whatsapp && (
              <a
                href={`https://wa.me/${tenant.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 font-semibold text-white hover:opacity-90"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-neutral-950 px-4 py-10 text-sm text-neutral-400 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-heading text-lg font-bold text-white">{tenant.name}</p>
            <p className="mt-1">Seminovos multimarcas com procedência.</p>
          </div>
          <ul className="space-y-1">
            {stores.map((s) => (
              <li key={s.id}>
                <span className="text-neutral-200">{s.name}</span> · {s.address}, {s.city}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-8 text-xs text-neutral-500">
          © {new Date().getFullYear()} {tenant.name} · Plataforma SoftMotors
        </p>
      </footer>
    </div>
  );
}
