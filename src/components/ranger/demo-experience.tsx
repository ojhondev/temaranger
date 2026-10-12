"use client";

import "driver.js/dist/driver.css";

import { driver, type DriveStep } from "driver.js";
import { CirclePlay, Gauge, MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Step = { target?: string; title: string; text: string };

/** Tour do site na demonstração: o que é cada parte e por que ela vende mais. */
const HOME: Step[] = [
  { title: "Este é o seu site", text: "Montamos agora, com o nome, a cor e o logo da {loja}. Em 1 minuto mostramos o que tem aqui e <b>por que cada parte existe</b>." },
  { target: "site-busca", title: "Busca no topo, como nos grandes portais", text: "O cliente digita marca ou modelo e cai direto no estoque. É o que ele já está acostumado a fazer na OLX e na WebMotors." },
  { target: "site-chips", title: "Atalhos de app", text: "No celular, o site funciona como um aplicativo: atalhos, abas fixas e favoritos. Mais de 80% das visitas de carro vêm do celular." },
  { target: "site-banner", title: "Banners de oferta", text: "Campanhas, feirões e taxas especiais. Você troca as imagens e os textos no Torque, em <b>Site › Banners</b>, quando quiser." },
  { target: "site-busca-rapida", title: "Busca rápida por preço", text: "Tipo, marca e faixa de preço em um toque: o caminho mais curto até o carro que cabe no bolso do cliente." },
  { target: "site-modelos", title: "Modelos mais buscados", text: "Os modelos do seu estoque com a foto real, para o cliente navegar como numa vitrine." },
  { target: "site-ofertas", title: "Seu estoque em destaque", text: "Os carros que você marca como <b>Destaque</b> ou com selo de campanha aparecem primeiro. Cada card leva à página completa do veículo." },
  { target: "site-vender", title: "Captação de usados", text: "A faixa “venda seu usado” traz carros para a sua loja: o contato chega direto no seu WhatsApp." },
  { target: "site-abas", title: "Abas fixas no celular", text: "Início, busca, favoritos, vender e menu sempre à mão, como num app nativo." },
  { target: "site-rodape", title: "Lojas, contatos e redes", text: "Endereços com mapa, WhatsApp de cada unidade e os ícones das suas redes sociais." },
  { title: "Agora abra um carro", text: "Clique em qualquer veículo para ver a página de anúncio, onde os clientes viram <b>leads</b>. Depois, conheça o <b>Torque</b> pela barra no fim da tela." },
];

const PDP: Step[] = [
  { target: "pdp-galeria", title: "Galeria do anúncio", text: "Fotos grandes, que deslizam com o dedo no celular. Você sobe as fotos no Torque arrastando da pasta do computador." },
  { target: "pdp-contato", title: "Onde o cliente vira lead", text: "Formulário, WhatsApp ou ligação: <b>você escolhe as regras</b> no Torque. Todo contato vai para o vendedor da vez no rodízio. Teste agora: a mensagem chega no seu WhatsApp." },
  { target: "pdp-referencia", title: "Referência de preço", text: "A comparação com a FIPE e o seu selo de referência passam confiança e ajudam a fechar negócio." },
  { title: "Agora, o painel", text: "Tudo o que você viu é controlado pelo <b>Torque</b>. Clique em <b>Conhecer o Torque</b> e cadastre um carro: ele aparece aqui na hora." },
];

function visible(target: string) {
  const els = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  return [...els].find((el) => el.getClientRects().length > 0);
}

/** Barra fixa da demonstração + tour guiado do site. */
export function DemoExperience({ storeName, salesWhatsapp }: { storeName: string; salesWhatsapp: string | null }) {
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  const isPdp = pathname.startsWith("/veiculo/");

  const run = useCallback(
    (steps: Step[]) => {
      const list: DriveStep[] = steps
        .map((s) => ({ s, el: s.target ? visible(s.target) : undefined }))
        .filter(({ s, el }) => !s.target || el)
        .map(({ s, el }) => ({ element: el, popover: { title: s.title, description: s.text.replace("{loja}", storeName), align: "start" as const } }));
      driver({
        steps: list,
        showProgress: true,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Próximo",
        prevBtnText: "Voltar",
        doneBtnText: "Entendi",
        popoverClass: "torque-tour",
        overlayOpacity: 0.55,
        stagePadding: 6,
        stageRadius: 12,
        smoothScroll: true,
      }).drive();
    },
    [storeName],
  );

  // Abre sozinho: na home logo após o formulário (?tour=1) e no primeiro anúncio visitado.
  useEffect(() => {
    const key = isPdp ? "sm-demo-tour-pdp" : "sm-demo-tour-home";
    let seen = false;
    try {
      seen = !!localStorage.getItem(key);
    } catch {}
    const fromForm = new URLSearchParams(window.location.search).get("tour") === "1";
    const wanted = isPdp ? !seen : fromForm || (!seen && pathname === "/");
    if (!wanted) return;
    const t = setTimeout(() => {
      run(isPdp ? PDP : HOME);
      try {
        localStorage.setItem(key, "1");
      } catch {}
      if (fromForm) window.history.replaceState(null, "", pathname);
    }, 900);
    return () => clearTimeout(t);
  }, [isPdp, pathname, run]);

  if (closed) return null;
  return (
    <div
      className={cn(
        "fixed inset-x-3 z-[62] mx-auto max-w-[760px] rounded-2xl bg-[#1f1f28] p-3 text-white shadow-[0_12px_40px_rgba(0,0,0,.35)] sm:inset-x-6 md:bottom-6 md:p-4",
        isPdp ? "bottom-[calc(80px+env(safe-area-inset-bottom))]" : "bottom-[calc(72px+env(safe-area-inset-bottom))]",
      )}
      role="region"
      aria-label="Demonstração"
    >
      <button type="button" onClick={() => setClosed(true)} aria-label="Fechar" className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-white/60 hover:text-white">
        <X className="size-4" />
      </button>
      <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:gap-4 md:pr-6">
        <p className="min-w-0 pr-6 text-[13px] leading-snug md:flex-1 md:pr-0 md:text-sm">
          <span className="font-semibold">Seu site está pronto.</span>{" "}
          <span className="text-white/70">Agora conheça o painel que controla tudo e cadastre um carro.</span>
        </p>
        <div className="grid shrink-0 grid-cols-[1fr_auto] gap-2 md:flex">
          <a href="/api/demo/torque" className="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#ff3916] px-4 text-sm font-bold hover:brightness-110">
            <Gauge className="size-4" /> Conhecer o Torque
          </a>
          <button type="button" onClick={() => run(isPdp ? PDP : HOME)} className="flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold hover:bg-white/20">
            <CirclePlay className="size-4" /> Tour
          </button>
          {salesWhatsapp && (
            <a
              href={`https://wa.me/${salesWhatsapp}?text=${encodeURIComponent(`Olá! Testei a demonstração da ${storeName} e quero contratar a SoftMotors.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold hover:bg-white/20 sm:flex"
            >
              <MessageCircle className="size-4" /> Quero contratar
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
