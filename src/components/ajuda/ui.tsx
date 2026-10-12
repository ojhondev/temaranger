import { headers } from "next/headers";
import Link from "next/link";
import {
  BookOpen,
  CarFront,
  ChevronRight,
  Gauge,
  Globe,
  Link2,
  MessagesSquare,
  Rocket,
  Search,
  ShieldCheck,
  Smartphone,
  Store,
  Users,
} from "lucide-react";

import type { HelpModule } from "@/content/ajuda";
import { PLATFORM_DOMAIN } from "@/lib/platform";
import { cn } from "@/lib/utils";

/** No subdomínio ajuda.* as páginas ficam na raiz; em qualquer outro endereço, em /ajuda. */
export async function helpBase() {
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  return host === `ajuda.${PLATFORM_DOMAIN}` ? "" : "/ajuda";
}

export const ICONS: Record<HelpModule["icon"], React.ComponentType<{ className?: string }>> = {
  rocket: Rocket,
  gauge: Gauge,
  messages: MessagesSquare,
  car: CarFront,
  store: Store,
  globe: Globe,
  link: Link2,
  users: Users,
  smartphone: Smartphone,
  shield: ShieldCheck,
  book: BookOpen,
};

/** Texto com **negrito**, sem HTML cru. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-[#1f1f28]">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function SearchBox({ base, defaultValue, big }: { base: string; defaultValue?: string; big?: boolean }) {
  return (
    <form action={`${base}/busca`} role="search" className={cn("flex w-full items-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,.12)]", big ? "h-14 pl-6 pr-2" : "h-11 border border-[#e2e2e8] pl-4 pr-1.5 shadow-none")}>
      <Search className={cn("shrink-0 text-[#6b6b76]", big ? "size-5" : "size-4")} />
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Busque por uma dúvida: pop-up, conectar OLX, domínio…"
        enterKeyHint="search"
        className={cn("min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-[#9a9aa5]", big ? "text-base" : "text-sm")}
      />
      <button className={cn("shrink-0 rounded-full bg-[#ff3916] font-semibold text-white hover:brightness-95", big ? "h-10 px-6 text-sm" : "h-8 px-4 text-xs")}>Buscar</button>
    </form>
  );
}

export function Breadcrumb({ base, items }: { base: string; items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Você está em" className="flex flex-wrap items-center gap-1.5 text-sm text-[#6b6b76]">
      <Link href={base || "/"} className="hover:text-[#ff3916]">
        Central de Ajuda
      </Link>
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <ChevronRight className="size-3.5" />
          {it.href ? (
            <Link href={it.href} className="hover:text-[#ff3916]">
              {it.label}
            </Link>
          ) : (
            <span className="text-[#1f1f28]">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
