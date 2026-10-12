import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Lightbulb, MapPin } from "lucide-react";

import { Feedback } from "@/components/ajuda/feedback";
import { Breadcrumb, Rich, helpBase } from "@/components/ajuda/ui";
import { findArticle, type Block } from "@/content/ajuda";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ modulo: string; artigo: string }> };

export async function generateMetadata({ params }: Props) {
  const { modulo, artigo } = await params;
  const found = findArticle(modulo, artigo);
  return found ? { title: found.article.title, description: found.article.summary } : {};
}

function BlockView({ block }: { block: Block }) {
  if ("h" in block) return <h2 className="mt-4 text-xl font-semibold text-[#1f1f28]">{block.h}</h2>;
  if ("p" in block)
    return (
      <p className="leading-relaxed text-[#3d3d47]">
        <Rich text={block.p} />
      </p>
    );
  if ("steps" in block)
    return (
      <ol className="flex flex-col gap-3">
        {block.steps.map((s, i) => (
          <li key={i} className="flex gap-3.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#ff3916] text-[13px] font-bold text-white">{i + 1}</span>
            <span className="pt-0.5 leading-relaxed text-[#3d3d47]">
              <Rich text={s} />
            </span>
          </li>
        ))}
      </ol>
    );
  if ("list" in block)
    return (
      <ul className="flex flex-col gap-2.5 pl-1">
        {block.list.map((s, i) => (
          <li key={i} className="flex gap-3 leading-relaxed text-[#3d3d47]">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#ff3916]" />
            <span>
              <Rich text={s} />
            </span>
          </li>
        ))}
      </ul>
    );
  const tip = "tip" in block;
  return (
    <p className={cn("flex gap-3 rounded-xl p-4 text-sm leading-relaxed", tip ? "bg-[#fff6e5] text-[#5c4300]" : "bg-[#fdecea] text-[#7a1d14]")}>
      {tip ? <Lightbulb className="mt-0.5 size-5 shrink-0" /> : <AlertTriangle className="mt-0.5 size-5 shrink-0" />}
      <span>
        <Rich text={tip ? block.tip : block.warn} />
      </span>
    </p>
  );
}

export default async function Artigo({ params }: Props) {
  const { modulo, artigo } = await params;
  const found = findArticle(modulo, artigo);
  if (!found) notFound();
  const { mod, article } = found;
  const base = await helpBase();
  const i = mod.articles.indexOf(article);
  const prev = mod.articles[i - 1];
  const next = mod.articles[i + 1];

  return (
    <main className="mx-auto grid max-w-[1200px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article className="min-w-0 max-w-[760px]">
        <Breadcrumb base={base} items={[{ label: mod.title, href: `${base}/${mod.slug}` }, { label: article.title }]} />
        <h1 className="mt-6 text-[clamp(1.6rem,3.5vw,2.25rem)] font-semibold leading-tight text-[#1f1f28]">{article.title}</h1>
        <p className="mt-2 text-lg text-[#6b6b76]">{article.summary}</p>
        {article.where && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#f3f3f6] px-3.5 py-1.5 text-sm text-[#3d3d47]">
            <MapPin className="size-4 text-[#ff3916]" /> No Torque: <strong className="font-semibold">{article.where}</strong>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-5">
          {article.body.map((b, n) => (
            <BlockView key={n} block={b} />
          ))}
        </div>

        <div className="mt-12 border-t border-[#ececf0] pt-6">
          <Feedback />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={`${base}/${mod.slug}/${prev.slug}`} className="group rounded-xl border border-[#e6e6ec] p-4 hover:border-[#ff3916]/50">
              <span className="flex items-center gap-1 text-xs text-[#9a9aa5]">
                <ArrowLeft className="size-3.5" /> Anterior
              </span>
              <span className="mt-1 block text-sm font-medium group-hover:text-[#ff3916]">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`${base}/${mod.slug}/${next.slug}`} className="group rounded-xl border border-[#e6e6ec] p-4 text-right hover:border-[#ff3916]/50">
              <span className="flex items-center justify-end gap-1 text-xs text-[#9a9aa5]">
                Próximo <ArrowRight className="size-3.5" />
              </span>
              <span className="mt-1 block text-sm font-medium group-hover:text-[#ff3916]">{next.title}</span>
            </Link>
          )}
        </div>
      </article>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#9a9aa5]">Neste módulo</p>
        <nav className="flex flex-col gap-0.5 border-l border-[#ececf0]">
          {mod.articles.map((a) => (
            <Link
              key={a.slug}
              href={`${base}/${mod.slug}/${a.slug}`}
              className={cn("-ml-px border-l-2 py-1.5 pl-4 text-sm leading-snug", a.slug === article.slug ? "border-[#ff3916] font-semibold text-[#ff3916]" : "border-transparent text-[#4a4a55] hover:text-[#1f1f28]")}
            >
              {a.title}
            </Link>
          ))}
        </nav>
      </aside>
    </main>
  );
}
