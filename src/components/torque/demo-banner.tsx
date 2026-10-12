import Link from "next/link";
import { CarFront, ExternalLink, MessageCircle } from "lucide-react";

/** Aviso fixo do Torque na demonstração: o que testar e como contratar. */
export function DemoBanner({ storeName, left, salesWhatsapp }: { storeName: string; left: number; salesWhatsapp: string | null }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl bg-[#1f1f28] px-5 py-4 text-white">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Demonstração da {storeName}</p>
        <p className="text-sm text-white/70">
          {left > 0
            ? "Cadastre um veículo com suas fotos e veja ele aparecer no seu site na hora. Explore à vontade: nada aqui afeta uma loja real."
            : "Seu veículo já está no site. Continue explorando o CRM, os portais e as configurações do site."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {left > 0 && (
          <Link href="/torque/estoque/novo" className="flex h-10 items-center gap-2 rounded-full bg-[#ff3916] px-4 text-sm font-bold hover:brightness-110">
            <CarFront className="size-4" /> Cadastrar meu carro ({left})
          </Link>
        )}
        <a href="/" target="_blank" className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold hover:bg-white/20">
          <ExternalLink className="size-4" /> Ver meu site
        </a>
        {salesWhatsapp && (
          <a
            href={`https://wa.me/${salesWhatsapp}?text=${encodeURIComponent(`Olá! Testei o Torque na demonstração da ${storeName} e quero contratar.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold hover:bg-white/20"
          >
            <MessageCircle className="size-4" /> Quero contratar
          </a>
        )}
      </div>
    </div>
  );
}
