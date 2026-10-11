import { cache } from "react";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { tenants, type Tenant } from "@/db/schema";

/**
 * Resolve a concessionária da requisição: pelo domínio próprio (`tenants.domain`) e,
 * sem correspondência, pelo tenant padrão (`DEFAULT_TENANT`, "demo" se ausente).
 */
export const getTenant = cache(async (): Promise<Tenant> => {
  const host = (await headers()).get("host")?.split(":")[0];
  if (host) {
    const [byDomain] = await db.select().from(tenants).where(eq(tenants.domain, host));
    if (byDomain) return byDomain;
  }
  const slug = process.env.DEFAULT_TENANT ?? "demo";
  const [fallback] = await db.select().from(tenants).where(eq(tenants.slug, slug));
  if (!fallback) throw new Error(`Tenant "${slug}" não encontrado. Rode \`npm run db:seed\`.`);
  return fallback;
});
