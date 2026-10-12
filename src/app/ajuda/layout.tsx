import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { helpBase } from "@/components/ajuda/ui";

export const metadata = {
  title: { default: "Central de Ajuda SoftMotors", template: "%s · Central de Ajuda SoftMotors" },
  description: "Tutoriais passo a passo de todas as funções do Torque: estoque, CRM, marketplaces, site, domínio e equipe.",
};

export default async function AjudaLayout({ children }: { children: React.ReactNode }) {
  const base = await helpBase();
  const support = process.env.SOFTMOTORS_WHATSAPP;
  return (
    <div className="flex min-h-dvh flex-col bg-white font-heading text-[#2e2e38]">
      <header className="sticky top-0 z-40 border-b border-[#ececf0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-4 sm:px-6">
          <Link href={base || "/"} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/softmotors-logo.png" alt="SoftMotors" className="h-6 w-auto sm:h-7" />
            <span className="hidden h-6 w-px bg-[#d6d6dc] sm:block" />
            <span className="hidden text-[15px] font-semibold sm:block">Central de Ajuda</span>
          </Link>
          <a href="https://softmotors.com.br" className="ml-auto text-sm font-medium text-[#6b6b76] hover:text-[#ff3916]">
            softmotors.com.br
          </a>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <section className="border-t border-[#ececf0] bg-[#f7f7f9]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 px-4 py-12 text-center sm:px-6">
          <p className="text-xl font-semibold text-[#1f1f28]">Não encontrou o que procurava?</p>
          <p className="max-w-md text-sm text-[#6b6b76]">Dentro do Torque, o botão “Posso ajudar?” abre o tour guiado de cada tela. Se ainda precisar, fale com o nosso time.</p>
          {support && (
            <a
              href={`https://wa.me/${support}?text=${encodeURIComponent("Olá! Preciso de ajuda com o Torque.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex h-11 items-center gap-2 rounded-full bg-[#ff3916] px-6 text-sm font-semibold text-white hover:brightness-95"
            >
              <MessageCircle className="size-4" /> Falar com o suporte
            </a>
          )}
        </div>
      </section>
      <footer className="border-t border-[#ececf0] py-6 text-center text-xs text-[#9a9aa5]">© {new Date().getFullYear()} SoftMotors. Todos os direitos reservados.</footer>
    </div>
  );
}
