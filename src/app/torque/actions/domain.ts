"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { tenants } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { PLATFORM_DOMAIN, apexOf, normalizeDomain } from "@/lib/platform";
import { addDomain, dnsReady, getDomain, removeDomain, vercelConfigured } from "@/lib/vercel-domains";

const MANAGERS = ["master", "manager"] as const;
const back = (q: string) => redirect(`/torque/site/dominio?${q}`);

/**
 * Conecta o domínio próprio da loja. O recomendado é o `www.` (CNAME funciona em qualquer
 * provedor); nesse caso o domínio sem www também é registrado e só redireciona para ele.
 */
export async function connectDomain(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const typed = normalizeDomain(String(fd.get("domain") ?? ""));
  if (!typed) back(`erro=${encodeURIComponent("Domínio inválido. Ex.: www.sualoja.com.br")}`);
  if (typed!.endsWith(PLATFORM_DOMAIN)) back(`erro=${encodeURIComponent("Esse já é o endereço da plataforma.")}`);

  const primary = typed!;
  const apex = apexOf(primary);

  const [taken] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.domain, primary), ne(tenants.id, s.tenantId)));
  if (taken) back(`erro=${encodeURIComponent("Esse domínio já está ligado a outra loja.")}`);

  await db.update(tenants).set({ domain: primary, domainVerifiedAt: null }).where(eq(tenants.id, s.tenantId));
  const main = await addDomain(primary);
  if (primary.startsWith("www.")) await addDomain(apex, primary);

  revalidatePath("/", "layout");
  back(main.ok ? "conectado=1" : `pendente=1`);
}

/** Confere se o DNS já aponta para a plataforma; quando sim, marca como verificado. */
export async function checkDomain() {
  const s = await requireSession([...MANAGERS]);
  const [t] = await db.select().from(tenants).where(eq(tenants.id, s.tenantId));
  if (!t?.domain) back("");
  const [project, dns] = await Promise.all([getDomain(t.domain!), dnsReady(t.domain!)]);
  // Sem token da Vercel não há como consultar o projeto: vale só o DNS (o master registrou à mão).
  const ok = (vercelConfigured() ? project.ok && project.verified : true) && dns === true;
  if (ok) await db.update(tenants).set({ domainVerifiedAt: new Date() }).where(eq(tenants.id, s.tenantId));
  revalidatePath("/torque/site/dominio");
  back(ok ? "verificado=1" : "aguardando=1");
}

export async function disconnectDomain() {
  const s = await requireSession([...MANAGERS]);
  const [t] = await db.select().from(tenants).where(eq(tenants.id, s.tenantId));
  if (t?.domain) {
    await removeDomain(t.domain);
    if (t.domain.startsWith("www.")) await removeDomain(apexOf(t.domain));
  }
  await db.update(tenants).set({ domain: null, domainVerifiedAt: null }).where(eq(tenants.id, s.tenantId));
  revalidatePath("/", "layout");
  back("removido=1");
}
