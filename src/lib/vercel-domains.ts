/**
 * Registro de domínios no projeto da Vercel que serve todas as lojas.
 * Requer VERCEL_API_TOKEN (criado pela SoftMotors em vercel.com/account/tokens),
 * VERCEL_PROJECT_ID e VERCEL_TEAM_ID. Sem o token, `vercelConfigured()` é falso e as telas
 * mostram o comando para registrar o domínio manualmente.
 */

const API = "https://api.vercel.com";

export const vercelConfigured = () => Boolean(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);

/** Comando equivalente, para quando o token ainda não foi configurado. */
export const manualCommand = (domain: string) => `npx vercel@latest domains add ${domain} ${process.env.VERCEL_PROJECT_NAME ?? "temaranger"}`;

/** Registros que o dono do domínio cria no DNS dele. */
export const DNS_TARGETS = { cname: "cname.vercel-dns.com", a: "76.76.21.21" } as const;

type DomainResult = { ok: true; verified: boolean; verification?: { type: string; domain: string; value: string }[] } | { ok: false; error: string };

async function call(path: string, init?: RequestInit) {
  const team = process.env.VERCEL_TEAM_ID ? `${path.includes("?") ? "&" : "?"}teamId=${process.env.VERCEL_TEAM_ID}` : "";
  const res = await fetch(`${API}${path}${team}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  return { res, body } as { res: Response; body: Record<string, unknown> & { error?: { code?: string; message?: string } } };
}

const project = () => process.env.VERCEL_PROJECT_ID!;

/** Adiciona o domínio ao projeto (idempotente). `redirectTo` faz o domínio só redirecionar. */
export async function addDomain(name: string, redirectTo?: string): Promise<DomainResult> {
  if (!vercelConfigured()) return { ok: false, error: "Token da Vercel não configurado." };
  const { res, body } = await call(`/v10/projects/${project()}/domains`, {
    method: "POST",
    body: JSON.stringify({ name, ...(redirectTo ? { redirect: redirectTo, redirectStatusCode: 308 } : {}) }),
  });
  if (res.ok) return { ok: true, verified: Boolean(body.verified), verification: body.verification as never };
  if (body.error?.code === "domain_already_in_use" || body.error?.code === "domain_already_exists") {
    return getDomain(name);
  }
  return { ok: false, error: body.error?.message ?? `Erro ${res.status} ao registrar ${name}.` };
}

export async function getDomain(name: string): Promise<DomainResult> {
  if (!vercelConfigured()) return { ok: false, error: "Token da Vercel não configurado." };
  const { res, body } = await call(`/v9/projects/${project()}/domains/${name}`);
  if (!res.ok) return { ok: false, error: body.error?.message ?? `Domínio ${name} não encontrado no projeto.` };
  return { ok: true, verified: Boolean(body.verified), verification: body.verification as never };
}

/** Checagem direta do DNS (sem a API): CNAME para a Vercel ou A no IP da Vercel. */
async function dnsPointsToVercel(name: string) {
  const dns = await import("node:dns/promises");
  const cname = await dns.resolveCname(name).catch(() => [] as string[]);
  if (cname.some((c) => c.replace(/\.$/, "").endsWith("vercel-dns.com"))) return true;
  const a = await dns.resolve4(name).catch(() => [] as string[]);
  return a.includes(DNS_TARGETS.a);
}

/** O DNS já aponta para a Vercel? (pela API: `misconfigured: false`; sem token: consulta direta) */
export async function dnsReady(name: string): Promise<boolean | null> {
  if (!vercelConfigured()) return dnsPointsToVercel(name);
  const { res, body } = await call(`/v6/domains/${name}/config`);
  if (!res.ok) return null;
  return body.misconfigured === false;
}

export async function removeDomain(name: string) {
  if (!vercelConfigured()) return;
  await call(`/v9/projects/${project()}/domains/${name}`, { method: "DELETE" });
}
