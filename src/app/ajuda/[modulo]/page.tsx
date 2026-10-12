import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Breadcrumb, ICONS, SearchBox, helpBase } from "@/components/ajuda/ui";
import { MODULES, findModule } from "@/content/ajuda";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ modulo: string }> };

export async function generateMetadata({ params }: Props) {
  const mod = findModule((await params).modulo);
  return mod ? { title: mod.title, description: mod.description } : {};
}

export default async function Modulo({ params }: Props) {
  const mod = findModule((await params).modulo);
  if (!mod) notFound();
  const base = await helpBase();
  const Icon = ICONS[mod.icon];

  return (
    <main className="mx-auto grid max-w-[1200px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="order-2 lg:order-1">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9a9aa5]">Módulos</p>
        <nav className="flex flex-col gap-0.5">
          {MODULES.map((m) => (
            <Link
              key={m.slug}
              href={`${base}/${m.slug}`}
              className={cn("rounded-lg px-3 py-2 text-sm", m.slug === mod.slug ? "bg-[#fff0ec] font-semibold text-[#ff3916]" : "text-[#3d3d47] hover:bg-[#f5f5f7]")}
            >
              {m.title}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="order-1 min-w-0 lg:order-2">
        <Breadcrumb base={base} items={[{ label: mod.title }]} />
        <div className="mt-6 flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#fff0ec] text-[#ff3916]">
            <Icon className="size-6" />
          </span>
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-[#1f1f28]">{mod.title}</h1>
            <p className="mt-1 text-[#6b6b76]">{mod.description}</p>
          </div>
        </div>
        <div className="mt-6 max-w-xl">
          <SearchBox base={base} />
        </div>
        <ul className="mt-8 divide-y divide-[#ececf0] border-y border-[#ececf0]">
          {mod.articles.map((a) => (
            <li key={a.slug}>
              <Link href={`${base}/${mod.slug}/${a.slug}`} className="group flex items-center gap-4 py-4">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[#1f1f28] group-hover:text-[#ff3916]">{a.title}</span>
                  <span className="mt-0.5 block text-sm text-[#6b6b76]">{a.summary}</span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-[#9a9aa5] group-hover:text-[#ff3916]" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
