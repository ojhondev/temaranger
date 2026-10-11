import { redirect } from "next/navigation";

import { TorqueIcon } from "@/components/torque/brand";
import { getSession } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar no Torque", robots: { index: false } };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ voltar?: string }> }) {
  if (await getSession()) redirect("/torque");
  const tenant = await getTenant();
  const { voltar } = await searchParams;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]" style={{ "--primary": "#e3173e" } as React.CSSProperties}>
      <section className="relative hidden overflow-hidden bg-[#2a2a33] p-14 text-white lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <TorqueIcon className="size-10" />
          <span className="font-heading text-3xl font-semibold tracking-tight">Torque</span>
        </div>
        <div className="mt-auto max-w-lg">
          <p className="font-heading text-[44px] font-semibold leading-[1.08]">
            O painel que coloca sua loja em <span className="text-primary">alta rotação</span>.
          </p>
          <p className="mt-5 text-lg text-white/70">
            Estoque, leads, portais e o seu site, tudo num cockpit só.
          </p>
        </div>
        {/* conta-giros decorativo */}
        <svg viewBox="0 0 200 200" className="pointer-events-none absolute -right-24 -top-24 size-[520px] opacity-[0.07]" aria-hidden>
          <circle cx="100" cy="100" r="90" fill="none" stroke="#fff" strokeWidth="10" />
          {Array.from({ length: 11 }, (_, i) => {
            const a = ((-210 + i * 24) * Math.PI) / 180;
            return <line key={i} x1={100 + 70 * Math.cos(a)} y1={100 + 70 * Math.sin(a)} x2={100 + 84 * Math.cos(a)} y2={100 + 84 * Math.sin(a)} stroke="#fff" strokeWidth="6" />;
          })}
          <line x1="100" y1="100" x2="160" y2="52" stroke="#e3173e" strokeWidth="8" strokeLinecap="round" />
        </svg>
        <p className="mt-10 text-xs text-white/40">{tenant.name} · Plataforma SoftMotors</p>
      </section>

      <section className="flex items-center justify-center bg-[#f5f5f7] px-6 py-16">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <TorqueIcon className="size-9" />
            <span className="font-heading text-2xl font-semibold">Torque</span>
          </div>
          <h1 className="font-heading text-[28px] font-semibold text-[#1f1f28]">Entrar</h1>
          <p className="mt-1 text-[#6b6b76]">Acesse o painel da {tenant.name}.</p>
          <LoginForm back={voltar} />
        </div>
      </section>
    </main>
  );
}
