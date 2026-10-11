import Link from "next/link";
import { AlertTriangle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

/** Card branco padrão do Torque. */
export function Panel({ className, children, ...props }: React.ComponentProps<"section">) {
  return (
    <section className={cn("rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(16,16,24,.06)]", className)} {...props}>
      {children}
    </section>
  );
}

/** Título de página + ações à direita. */
export function PageHeader({ title, kicker, children }: { title: string; kicker?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker && <p className="text-sm text-[#6b6b76]">{kicker}</p>}
        <h1 className="text-2xl font-semibold text-[#1f1f28]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/** Aviso dos cards (azul = informação, vermelho = problema, verde = ok). */
export function Notice({ tone, children }: { tone: "blue" | "red" | "green"; children: React.ReactNode }) {
  const styles = {
    blue: "border-[#9fd3ee] bg-[#e5f4fc] text-[#1d5f80]",
    red: "border-[#f6b3b3] bg-[#fde8e8] text-[#a3242f]",
    green: "border-[#a8dfbd] bg-[#e7f7ed] text-[#1d6b3d]",
  }[tone];
  const Icon = tone === "red" ? AlertTriangle : Info;
  return (
    <p className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] font-medium", styles)}>
      <Icon className="size-4 shrink-0" /> {children}
    </p>
  );
}

/** Botão escuro de largura total do rodapé dos cards ("Gerenciar leads"). */
export function DarkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-auto flex h-11 w-full items-center justify-center rounded-lg bg-[#2a2a33] text-sm font-semibold text-white transition hover:bg-black"
    >
      {children}
    </Link>
  );
}

export function Legend({ color, value, label }: { color: string; value: number | string; label: string }) {
  return (
    <li className="flex items-center gap-3 text-[13px]">
      <span className="size-2 shrink-0 rounded-full" style={{ background: color }} />
      <span className="w-9 font-semibold tabular-nums">{value}</span>
      <span className="whitespace-nowrap text-[#4a4a55]">{label}</span>
    </li>
  );
}

export const field =
  "h-11 w-full rounded-lg border border-[#d6d6dc] bg-white px-3.5 text-sm outline-none transition focus:border-[#2a2a33] focus:ring-2 focus:ring-[#2a2a33]/10";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-[13px] font-medium text-[#3d3d47]", className)}>
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-[#8a8a94]">{hint}</span>}
    </label>
  );
}

export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button className={cn("h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition hover:brightness-95", className)}>
      {children}
    </button>
  );
}

/** Abas de navegação entre telas de um módulo. */
export function Tabs({ items, active }: { items: { href: string; label: string }[]; active: string }) {
  return (
    <nav className="scrollbar-none mb-6 flex gap-1 overflow-x-auto border-b border-[#e2e2e8]">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition",
            active === t.href ? "border-primary text-[#1f1f28]" : "border-transparent text-[#6b6b76] hover:text-[#1f1f28]",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/** Mensagem de sucesso após salvar (via ?salvo=1). */
export function Saved({ show, children = "Alterações salvas e já publicadas no site." }: { show: boolean; children?: React.ReactNode }) {
  if (!show) return null;
  return <p className="mb-5 rounded-lg border border-[#a8dfbd] bg-[#e7f7ed] px-4 py-3 text-sm font-medium text-[#1d6b3d]">{children}</p>;
}
