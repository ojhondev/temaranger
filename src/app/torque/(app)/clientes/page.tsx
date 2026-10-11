import { desc, ne, sql } from "drizzle-orm";
import { ExternalLink, Globe, RefreshCw } from "lucide-react";

import { retrySubdomain, toggleClient } from "@/app/torque/actions/clients";
import { PageHeader, Panel } from "@/components/torque/ui";
import { db } from "@/db";
import { tenants, users, vehicles } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { publishedAt } from "@/lib/format";
import { PLATFORM_DOMAIN, platformHost, platformUrl } from "@/lib/platform";
import { manualCommand, vercelConfigured } from "@/lib/vercel-domains";
import { cn } from "@/lib/utils";

import { NewClientForm } from "./new-client-form";

export const metadata = { title: "Clientes" };

export default async function Clientes() {
  await requireSession(["master"]);
  const [list, stock, people] = await Promise.all([
    db.select().from(tenants).orderBy(desc(tenants.createdAt)),
    db
      .select({ tenantId: vehicles.tenantId, n: sql<number>`count(*)::int` })
      .from(vehicles)
      .where(ne(vehicles.status, "sold"))
      .groupBy(vehicles.tenantId),
    db
      .select({ tenantId: users.tenantId, n: sql<number>`count(*)::int`, last: sql<string | null>`max(${users.lastLoginAt})` })
      .from(users)
      .groupBy(users.tenantId),
  ]);
  const rows = list.map((tenant) => {
    const p = people.find((x) => x.tenantId === tenant.id);
    return {
      tenant,
      vehicles: stock.find((x) => x.tenantId === tenant.id)?.n ?? 0,
      team: p?.n ?? 0,
      lastLogin: p?.last ?? null,
    };
  });
  const apiReady = vercelConfigured();

  return (
    <div>
      <PageHeader title="Clientes" kicker="SoftMotors · lojas na plataforma" />

      {!apiReady && (
        <p className="mb-5 rounded-lg border border-[#f6d58e] bg-[#fff8e6] px-4 py-3 text-sm text-[#7a5300]">
          O token da API da Vercel ainda não foi configurado: a loja é criada normalmente, mas o endereço{" "}
          <b>{`{loja}.${PLATFORM_DOMAIN}`}</b> precisa ser registrado com o comando mostrado em cada linha.
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Panel className="p-0" data-tour="clientes-lista">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wide text-[#6b6b76]">
                <tr>
                  <th className="px-5 py-3 font-medium">Loja</th>
                  <th className="px-5 py-3 font-medium">Endereços</th>
                  <th className="px-5 py-3 text-right font-medium">Estoque</th>
                  <th className="px-5 py-3 font-medium">Último acesso</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ tenant: t, vehicles: nVehicles, team, lastLogin }) => (
                  <tr key={t.id} className={cn("border-b align-top last:border-0", !t.active && "opacity-50")}>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 font-semibold">
                        <span className="size-3 rounded-full" style={{ background: t.primaryColor }} />
                        {t.name}
                      </p>
                      <p className="text-xs text-[#6b6b76]">
                        Tema {t.theme} · {team} {team === 1 ? "usuário" : "usuários"} · desde {publishedAt(t.createdAt)}
                      </p>
                      {!t.active && <p className="text-xs font-semibold text-primary">Desativada</p>}
                    </td>
                    <td className="px-5 py-4 text-[13px]">
                      <a href={platformUrl(t.slug)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        {platformHost(t.slug)} <ExternalLink className="size-3" />
                      </a>
                      {t.domain ? (
                        <p className="mt-1 flex items-center gap-1 text-xs">
                          <Globe className="size-3" /> {t.domain}
                          <span className={cn("rounded px-1.5 font-semibold", t.domainVerifiedAt ? "bg-[#e7f7ed] text-[#1d6b3d]" : "bg-[#fff3d6] text-[#7a5300]")}>
                            {t.domainVerifiedAt ? "no ar" : "aguardando DNS"}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-[#9a9aa5]">Sem domínio próprio</p>
                      )}
                      {!apiReady && (
                        <code className="mt-2 block w-fit rounded bg-[#f5f5f7] px-2 py-1 text-[11px] text-[#4a4a55]">{manualCommand(platformHost(t.slug))}</code>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">{nVehicles}</td>
                    <td className="px-5 py-4 text-[13px] text-[#6b6b76]">{lastLogin ? publishedAt(new Date(lastLogin)) : "Nunca"}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <a
                          href={`${platformUrl(t.slug)}/torque`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 rounded-lg bg-[#2a2a33] px-3 text-xs font-semibold leading-8 text-white"
                        >
                          Abrir Torque
                        </a>
                        {apiReady && (
                          <form action={retrySubdomain}>
                            <input type="hidden" name="id" value={t.id} />
                            <button className="flex items-center gap-1 text-xs text-[#6b6b76] hover:text-[#1f1f28]">
                              <RefreshCw className="size-3" /> Registrar endereço
                            </button>
                          </form>
                        )}
                        <form action={toggleClient}>
                          <input type="hidden" name="id" value={t.id} />
                          <input type="hidden" name="active" value={t.active ? "0" : "1"} />
                          <button className="text-xs font-medium text-primary hover:underline">{t.active ? "Desativar" : "Reativar"}</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="self-start" data-tour="clientes-nova">
          <h2 className="text-base font-semibold">Nova loja</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">
            Cria a loja com o tema Ranger, o login do gestor e o site em <b>{`{endereço}.${PLATFORM_DOMAIN}`}</b>. Não há deploy: fica no ar na hora.
          </p>
          <NewClientForm platformDomain={PLATFORM_DOMAIN} />
        </Panel>
      </div>
    </div>
  );
}

