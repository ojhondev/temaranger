import Link from "next/link";

import { Breadcrumb, SearchBox, helpBase } from "@/components/ajuda/ui";
import { searchArticles } from "@/content/ajuda";

export const metadata = { title: "Busca", robots: { index: false } };

export default async function Busca({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const base = await helpBase();
  const results = searchArticles(q);

  return (
    <main className="mx-auto max-w-[860px] px-4 py-8 sm:px-6">
      <Breadcrumb base={base} items={[{ label: "Busca" }]} />
      <div className="mt-6">
        <SearchBox base={base} defaultValue={q} />
      </div>
      <p className="mt-6 text-sm text-[#6b6b76]">
        {q ? `${results.length} ${results.length === 1 ? "resultado" : "resultados"} para “${q}”` : "Digite o que você procura."}
      </p>
      <ul className="mt-4 divide-y divide-[#ececf0] border-y border-[#ececf0]">
        {results.map(({ mod, article }) => (
          <li key={`${mod.slug}/${article.slug}`}>
            <Link href={`${base}/${mod.slug}/${article.slug}`} className="group block py-4">
              <span className="text-xs font-medium uppercase tracking-wide text-[#ff3916]">{mod.title}</span>
              <span className="mt-1 block font-medium text-[#1f1f28] group-hover:text-[#ff3916]">{article.title}</span>
              <span className="mt-0.5 block text-sm text-[#6b6b76]">{article.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
      {q && !results.length && <p className="mt-6 text-sm text-[#3d3d47]">Tente outras palavras, como “banner”, “WhatsApp” ou “vendedor”.</p>}
    </main>
  );
}
