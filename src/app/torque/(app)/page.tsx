import Link from "next/link";
import { headers } from "next/headers";
import { CarFront, ChevronRight, Globe, Lightbulb, MessagesSquare, Store } from "lucide-react";

import { CardMark } from "@/components/torque/brand";
import { Donut } from "@/components/torque/donut";
import { HelpLinks } from "@/components/torque/help-links";
import { OpportunityRail } from "@/components/torque/opportunities";
import { DarkButton, Legend, Notice, Panel } from "@/components/torque/ui";
import { getHome } from "@/db/torque-queries";
import { isManager, requireSession } from "@/lib/auth";
import { CHANNELS, MARKETPLACES } from "@/lib/format";
import { getTenant } from "@/lib/tenant";

const CHANNEL_COLORS = ["#ff3916", "#ffb3a3", "#9b5cf6", "#fbbf24", "#2a2a33", "#cfd0d8"];

export default async function Inicio({ searchParams }: { searchParams: Promise<{ "sem-permissao"?: string }> }) {
  const session = await requireSession();
  const tenant = await getTenant();
  const manager = isManager(session);
  const h = await getHome(tenant.id, manager ? undefined : session.user.id);
  const host = (await headers()).get("host") ?? "";
  const denied = (await searchParams)["sem-permissao"];

  const month = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const channels = [...h.byChannel].sort((a, b) => b.n - a.n);
  const top = channels.slice(0, 3);
  const others = channels.slice(3).reduce((s, c) => s + c.n, 0);
  const connected = h.accounts.filter((a) => a.status === "connected");
  const onlySite = h.inStock - h.publishedVehicles;

  return (
    <div className="flex flex-col gap-5">
      {denied && <Notice tone="red">Seu acesso não permite abrir aquela tela. Fale com o gestor da loja.</Notice>}
      <div>
        <p className="text-sm text-[#6b6b76]">{tenant.name}</p>
        <h1 className="text-[26px] font-semibold">Bem-vindo, {session.user.name.split(" ")[0]}</h1>
      </div>

      {manager && (
        <Panel className="flex flex-wrap items-center gap-x-12 gap-y-4 py-4">
          <CardMark icon={Store} label="minha loja" />
          <div className="text-[13px]">
            <p className="text-[#6b6b76]">Situação</p>
            <span className="mt-1 inline-block rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-xs font-semibold text-[#1d6b3d]">
              Site no ar
            </span>
          </div>
          <div className="text-[13px]">
            <p className="text-[#6b6b76]">Endereço do site</p>
            <a href="/" target="_blank" className="mt-0.5 block font-semibold hover:text-primary">
              {tenant.domain ?? host}
            </a>
          </div>
          <div className="text-[13px]">
            <p className="text-[#6b6b76]">Lojas</p>
            <p className="mt-0.5 font-semibold">{h.stores}</p>
          </div>
          <div className="text-[13px]">
            <p className="text-[#6b6b76]">Tema</p>
            <p className="mt-0.5 font-semibold">Ranger</p>
          </div>
          <Link href="/torque/site" className="ml-auto flex items-center gap-1 text-sm font-semibold text-primary">
            Editar site <ChevronRight className="size-4" />
          </Link>
        </Panel>
      )}

      <div className={`grid gap-5 [&>*]:min-w-0 ${manager ? "md:grid-cols-2 2xl:grid-cols-4" : "md:grid-cols-2"}`}>
        {/* CRM */}
        <Panel className="flex flex-col gap-4" data-tour="card-crm">
          <div className="flex items-center justify-between">
            <CardMark icon={MessagesSquare} label="crm" />
            <span className="text-xs capitalize text-[#6b6b76]">{month}</span>
          </div>
          {h.pending > 0 ? (
            <Notice tone="blue">
              Você possui {h.pending} {h.pending === 1 ? "lead sem resposta" : "leads sem resposta"}.
            </Notice>
          ) : (
            <Notice tone="green">Nenhum lead esperando resposta.</Notice>
          )}
          <div>
            <p className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-[34px] font-semibold leading-none">{h.leadsMonth}</span>
              <span className="text-sm">Leads recebidos</span>
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <ul className="flex min-w-0 flex-col gap-2.5">
                {top.map((c, i) => (
                  <Legend key={c.channel} color={CHANNEL_COLORS[i]} value={c.n} label={CHANNELS[c.channel]} />
                ))}
                {others > 0 && <Legend color={CHANNEL_COLORS[5]} value={others} label="Outros canais" />}
              </ul>
              <Donut
                size={112}
                thickness={26}
                segments={[
                  ...top.map((c, i) => ({ value: c.n, color: CHANNEL_COLORS[i] })),
                  { value: others, color: CHANNEL_COLORS[5] },
                ]}
              />
            </div>
          </div>
          <DarkButton href="/torque/crm">Gerenciar leads</DarkButton>
        </Panel>

        {/* Estoque */}
        <Panel className="flex flex-col gap-4" data-tour="card-estoque">
          <CardMark icon={CarFront} label="estoque" />
          {manager && h.errors > 0 ? (
            <Notice tone="red">
              Existem {h.errors} {h.errors === 1 ? "anúncio" : "anúncios"} com erro.
            </Notice>
          ) : (
            <Notice tone="green">Nenhum anúncio com erro.</Notice>
          )}
          <div>
            <p className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-[34px] font-semibold leading-none">{h.inStock}</span>
              <span className="text-sm">Veículos no estoque</span>
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <ul className="flex min-w-0 flex-col gap-2.5">
                <Legend color="#ff3916" value={h.publishedVehicles} label="Publicados nos portais" />
                <Legend color="#ffb3a3" value={onlySite} label="Só no site" />
                <Legend color="#9b5cf6" value={h.reserved} label="Reservados" />
              </ul>
              <Donut
                size={112}
                thickness={26}
                segments={[
                  { value: h.publishedVehicles, color: "#ff3916" },
                  { value: onlySite, color: "#ffb3a3" },
                  { value: h.reserved, color: "#9b5cf6" },
                ]}
              />
            </div>
          </div>
          <DarkButton href="/torque/estoque">Gerenciar estoque</DarkButton>
        </Panel>

        {manager && (
          <>
            {/* Marketplaces */}
            <Panel className="flex flex-col gap-3" data-tour="card-marketplaces">
              <CardMark icon={Store} label="marketplaces" />
              <p className="text-[13px] text-[#4a4a55]">Seus carros anunciados nos portais, sem cadastrar um por um.</p>
              <div>
                <p className="text-[30px] font-semibold leading-tight">
                  {connected.length} <span className="text-lg font-medium text-[#6b6b76]">de 3</span>
                </p>
                <p className="text-xs text-[#6b6b76]">Portais conectados</p>
              </div>
              <ul className="flex flex-col gap-2">
                {(Object.keys(MARKETPLACES) as (keyof typeof MARKETPLACES)[]).map((m) => {
                  const on = connected.some((a) => a.marketplace === m);
                  return (
                    <li key={m} className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${on ? "bg-[#1c9b4a]" : "bg-[#cfd0d8]"}`} />
                        {MARKETPLACES[m]}
                      </span>
                      <span className="text-[#6b6b76]">{on ? `${h.activeByPortal[m] ?? 0} anúncios` : "Não conectado"}</span>
                    </li>
                  );
                })}
              </ul>
              <DarkButton href="/torque/marketplaces">
                {connected.length < 3 ? "Conectar portais" : "Gerenciar portais"}
              </DarkButton>
            </Panel>

            {/* Site + ajuda */}
            <Panel className="flex flex-col gap-3">
              <CardMark icon={Globe} label="site" />
              <p className="text-[13px] text-[#4a4a55]">Banners, textos, logo, WhatsApp e lojas: você muda quando quiser.</p>
              <Link
                href="/torque/site/banners"
                className="flex h-11 w-full items-center justify-center rounded-lg bg-[#2a2a33] text-sm font-semibold text-white hover:bg-black"
              >
                Trocar banners
              </Link>
              <div className="mt-3 border-t pt-3">
                <p className="text-[15px] font-semibold">Precisando de ajuda?</p>
                <HelpLinks />
              </div>
            </Panel>
          </>
        )}
      </div>

      {manager && (
        <section className="grid gap-6 rounded-xl py-4 lg:grid-cols-[minmax(240px,320px)_1fr] lg:items-center">
          <div className="lg:pl-2">
            <Lightbulb className="size-6 text-primary" />
            <h2 className="mt-3 text-[22px] font-semibold leading-tight">Oportunidades de negócio para sua loja</h2>
            <p className="mt-2 text-sm text-[#6b6b76]">Atalhos para vender mais com o que o Torque já oferece.</p>
          </div>
          <OpportunityRail connected={connected.map((a) => a.marketplace)} />
        </section>
      )}
    </div>
  );
}
