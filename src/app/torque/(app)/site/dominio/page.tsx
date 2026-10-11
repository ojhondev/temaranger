import { CheckCircle2, Clock, Globe } from "lucide-react";

import { checkDomain, connectDomain, disconnectDomain } from "@/app/torque/actions/domain";
import { ConfirmButton } from "@/components/torque/confirm-button";
import { SiteTabs } from "@/components/torque/site-tabs";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { isMaster, requireSession } from "@/lib/auth";
import { apexOf, platformHost, platformUrl } from "@/lib/platform";
import { getTenant } from "@/lib/tenant";
import { DNS_TARGETS, manualCommand, vercelConfigured } from "@/lib/vercel-domains";

export const metadata = { title: "Site · Domínio" };

type Q = { erro?: string; conectado?: string; pendente?: string; verificado?: string; aguardando?: string; removido?: string };

function DnsTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-[#f5f5f7] text-left text-xs uppercase tracking-wide text-[#6b6b76]">
          <tr>
            <th className="px-4 py-2 font-medium">Tipo</th>
            <th className="px-4 py-2 font-medium">Nome</th>
            <th className="px-4 py-2 font-medium">Valor / Aponta para</th>
          </tr>
        </thead>
        <tbody className="font-mono text-[13px]">
          {rows.map(([type, name, value]) => (
            <tr key={type + name} className="border-t">
              <td className="px-4 py-2.5 font-semibold">{type}</td>
              <td className="px-4 py-2.5">{name}</td>
              <td className="px-4 py-2.5">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function SiteDominio({ searchParams }: { searchParams: Promise<Q> }) {
  const s = await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const q = await searchParams;
  const domain = tenant.domain;
  const apex = domain ? apexOf(domain) : "";
  const sub = domain && domain !== apex ? domain.slice(0, -apex.length - 1) : null;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Site" kicker="Domínio" />
      <SiteTabs active="/torque/site/dominio" />
      <Saved show={!!q.verificado}>Domínio verificado: seu site já responde nele, com cadeado de segurança.</Saved>
      <Saved show={!!q.removido}>Domínio desconectado. O site continua no endereço da plataforma.</Saved>
      {q.erro && <p className="mb-4 rounded-lg bg-[#fde8e8] px-4 py-3 text-sm font-medium text-[#a3242f]">{q.erro}</p>}
      {q.aguardando && (
        <p className="mb-4 rounded-lg border border-[#f6d58e] bg-[#fff8e6] px-4 py-3 text-sm text-[#7a5300]">
          Ainda não identificamos o DNS apontando para a plataforma. Alterações de DNS levam de alguns minutos a algumas horas; tente de novo daqui a pouco.
        </p>
      )}

      <div className="flex flex-col gap-5">
        <Panel>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Globe className="size-5 text-primary" /> Endereço da plataforma
          </h2>
          <p className="mt-1 text-sm text-[#6b6b76]">Seu site já está no ar aqui, mesmo sem domínio próprio.</p>
          <a href={platformUrl(tenant.slug)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-mono text-sm font-semibold text-primary">
            {platformHost(tenant.slug)}
          </a>
        </Panel>

        {!domain ? (
          <Panel data-tour="dominio-conectar">
            <h2 className="text-base font-semibold">Usar o domínio da sua loja</h2>
            <p className="mb-4 mt-1 text-sm text-[#6b6b76]">
              Digite o endereço com <b>www</b> (ex.: www.sualoja.com.br). O endereço sem www também passa a funcionar e leva para o mesmo site.
            </p>
            <form action={connectDomain} className="flex flex-wrap items-end gap-3">
              <Field label="Domínio" className="min-w-64 flex-1">
                <input name="domain" required placeholder="www.sualoja.com.br" className={field} />
              </Field>
              <SubmitButton>Conectar domínio</SubmitButton>
            </form>
          </Panel>
        ) : (
          <Panel data-tour="dominio-dns">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{domain}</h2>
                {tenant.domainVerifiedAt ? (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#1d6b3d]">
                    <CheckCircle2 className="size-4" /> No ar, com cadeado de segurança
                  </p>
                ) : (
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#7a5300]">
                    <Clock className="size-4" /> Aguardando a configuração do DNS
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <form action={checkDomain}>
                  <button className="h-10 rounded-lg bg-[#2a2a33] px-4 text-sm font-semibold text-white">Verificar agora</button>
                </form>
                <form action={disconnectDomain}>
                  <ConfirmButton message="Desconectar o domínio? O site continua no endereço da plataforma." className="h-10 px-2 text-sm font-medium text-primary hover:underline">
                    Desconectar
                  </ConfirmButton>
                </form>
              </div>
            </div>

            {!tenant.domainVerifiedAt && (
              <div className="mt-5 flex flex-col gap-3">
                <p className="text-sm">
                  No painel onde o domínio <b>{apex}</b> foi registrado (Registro.br, HostGator, GoDaddy…), crie estes registros de DNS:
                </p>
                <DnsTable
                  rows={[
                    ...(sub ? ([["CNAME", sub, DNS_TARGETS.cname]] as [string, string, string][]) : []),
                    ["A", "@ (sem nada / raiz)", DNS_TARGETS.a],
                  ]}
                />
                <p className="text-xs text-[#6b6b76]">
                  Se já existir um registro com o mesmo nome apontando para o site antigo, substitua. Não mexa nos registros de e-mail (MX).
                  Depois clique em <b>Verificar agora</b>.
                </p>
              </div>
            )}
          </Panel>
        )}

        {isMaster(s) && !vercelConfigured() && domain && (
          <p className="rounded-lg border border-dashed border-[#d6d6dc] px-4 py-3 text-xs text-[#6b6b76]">
            <b>Master:</b> sem o token da Vercel, registre o domínio manualmente:{" "}
            <code className="rounded bg-[#f5f5f7] px-1.5 py-0.5">{manualCommand(domain)}</code>
            {sub && (
              <>
                {" "}e <code className="rounded bg-[#f5f5f7] px-1.5 py-0.5">{manualCommand(apex)}</code>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
