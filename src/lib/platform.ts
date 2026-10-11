/**
 * Domínio da plataforma: cada loja ganha `{slug}.softmotors.com.br` como endereço provisório
 * (e definitivo, se não tiver domínio próprio). Na HostGator existe um CNAME curinga
 * `*.softmotors.com.br → cname.vercel-dns.com`; cada subdomínio é registrado na Vercel ao
 * criar a loja (ver lib/vercel-domains).
 */
export const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN ?? "softmotors.com.br";

/** Subdomínios que não podem virar loja. */
export const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "torque", "painel", "mail", "email", "smtp", "ftp", "cpanel",
  "webmail", "blog", "suporte", "ajuda", "status", "docs", "demo-softmotors", "softmotors",
]);

export const platformHost = (slug: string) => `${slug}.${PLATFORM_DOMAIN}`;
export const platformUrl = (slug: string) => `https://${platformHost(slug)}`;

/** Slug do subdomínio da plataforma (`lojab.softmotors.com.br` → `lojab`), ou null. */
export function slugFromHost(host: string) {
  const suffix = `.${PLATFORM_DOMAIN}`;
  if (!host.endsWith(suffix)) return null;
  const sub = host.slice(0, -suffix.length);
  return sub && !sub.includes(".") ? sub : null;
}

/** Normaliza o domínio digitado pela loja: sem protocolo, caminho ou porta, em minúsculas. */
export function normalizeDomain(input: string) {
  const d = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
  return /^(?=.{4,253}$)([a-z0-9-]+\.)+[a-z]{2,}$/.test(d) ? d : null;
}

/** `www.loja.com.br` ⇄ `loja.com.br` */
export const apexOf = (domain: string) => domain.replace(/^www\./, "");
