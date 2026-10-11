import { cache } from "react";
import { eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { tenants, type Tenant } from "@/db/schema";

import { apexOf, slugFromHost } from "./platform";

/** Host da requisição, sem porta. */
export async function requestHost() {
  return ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
}

/**
 * Resolve a concessionária da requisição, nesta ordem:
 * 1. domínio próprio (`tenants.domain`, com ou sem www);
 * 2. subdomínio da plataforma (`{slug}.softmotors.com.br`) — inexistente dá 404;
 * 3. loja padrão (`DEFAULT_TENANT`), só para localhost e o endereço técnico da Vercel.
 */
export const getTenant = cache(async (): Promise<Tenant> => {
  const host = await requestHost();
  if (host) {
    const apex = apexOf(host);
    const [byDomain] = await db
      .select()
      .from(tenants)
      .where(or(eq(tenants.domain, host), eq(tenants.domain, apex), eq(tenants.domain, `www.${apex}`)));
    if (byDomain) return byDomain;

    const slug = slugFromHost(host);
    if (slug) {
      const [bySlug] = await db.select().from(tenants).where(eq(tenants.slug, slug));
      if (!bySlug) notFound();
      return bySlug;
    }
  }
  const slug = process.env.DEFAULT_TENANT ?? "demo";
  const [fallback] = await db.select().from(tenants).where(eq(tenants.slug, slug));
  if (!fallback) throw new Error(`Tenant "${slug}" não encontrado. Rode \`npm run db:seed\`.`);
  return fallback;
});
