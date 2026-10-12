import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ICONS, SearchBox, helpBase } from "@/components/ajuda/ui";
import { MODULES } from "@/content/ajuda";

export const metadata = { title: { absolute: "Central de Ajuda SoftMotors" } };

export default async function Ajuda() {
  const base = await helpBase();
  const popular = [
    ["marketplaces", "conectar-portal"],
    ["estoque", "cadastrar-veiculo"],
    ["site", "pop-up"],
    ["dominio", "conectar-dominio"],
    ["crm", "como-funciona-o-rodizio"],
  ] as const;

  return (
    <>
      <section className="relative overflow-hidden bg-[#1f1f28]">
        <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-20 -top-28 size-[460px] opacity-[0.07]" aria-hidden>
          <circle cx="100" cy="100" r="90" fill="none" stroke="#fff" strokeWidth="10" />
          <line x1="100" y1="100" x2="160" y2="52" stroke="#ff3916" strokeWidth="10" strokeLinecap="round" />
        </svg>
        <div className="relative mx-auto flex max-w-[860px] flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="text-[clamp(1.75rem,4.5vw,2.75rem)] font-semibold leading-tight text-white">Sobre o que é sua dúvida?</h1>
          <SearchBox base={base} big />
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <span className="text-white/60">Mais buscados:</span>
            {popular.map(([m, a]) => {
              const art = MODULES.find((x) => x.slug === m)!.articles.find((x) => x.slug === a)!;
              return (
                <Link key={a} href={`${base}/${m}/${a}`} className="rounded-full bg-white/10 px-3 py-1 text-white/90 hover:bg-white/20">
                  {art.title.replace(/^Como /, "").replace(/\?$/, "")}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <h2 className="text-lg font-semibold text-[#1f1f28]">Módulos do Torque</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = ICONS[m.icon];
            return (
              <section key={m.slug} className="flex flex-col rounded-2xl border border-[#e6e6ec] p-6 transition hover:border-[#ff3916]/40 hover:shadow-[0_6px_24px_rgba(0,0,0,.06)]">
                <Link href={`${base}/${m.slug}`} className="group flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#fff0ec] text-[#ff3916]">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-[17px] font-semibold text-[#1f1f28] group-hover:text-[#ff3916]">{m.title}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-[#6b6b76]">{m.description}</span>
                  </span>
                </Link>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5 border-t border-[#f0f0f3] pt-4 text-sm">
                  {m.articles.slice(0, 3).map((a) => (
                    <li key={a.slug}>
                      <Link href={`${base}/${m.slug}/${a.slug}`} className="text-[#3d3d47] hover:text-[#ff3916] hover:underline">
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`${base}/${m.slug}`} className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#ff3916]">
                  {m.articles.length > 3 ? `Mais artigos (${m.articles.length})` : "Ver módulo"} <ArrowRight className="size-4" />
                </Link>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
