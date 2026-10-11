import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { HERO_BANNERS, fill } from "@/config/ranger";
import { db } from "@/db";
import { banners, stores, tenants, users, type Tenant } from "@/db/schema";

import { slugify } from "./format";
import { hashPassword } from "./password";
import { RESERVED_SLUGS, platformHost } from "./platform";
import { addDomain } from "./vercel-domains";

/** Banners com que toda loja nasce (editáveis no Torque). */
export function defaultBanners(tenant: Pick<Tenant, "id" | "name">) {
  return [
    ...HERO_BANNERS.map((b, i) => ({
      tenantId: tenant.id,
      placement: "hero" as const,
      title: fill(b.title, tenant.name),
      subtitle: fill(b.subtitle, tenant.name),
      ctaLabel: b.cta,
      href: b.href,
      position: i,
    })),
    {
      tenantId: tenant.id,
      placement: "promo" as const,
      heading: "Vai comprar ou vender?",
      title: "Preços pela Tabela FIPE",
      subtitle: "Confira para negociar",
      ctaLabel: "Ver agora",
      href: "/estoque?ordem=menor-preco",
      position: 0,
    },
    {
      tenantId: tenant.id,
      placement: "promo" as const,
      heading: "Financie com a gente",
      title: "Você de carro novo",
      subtitle: "Parcelas que cabem no bolso",
      ctaLabel: "Ver ofertas",
      href: "/estoque",
      position: 1,
    },
  ];
}

/** Senha provisória legível (sem 0/O, 1/l), para o gestor trocar no primeiro acesso. */
export function tempPassword() {
  const abc = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from(randomBytes(12), (b) => abc[b % abc.length]).join("");
}

export type ProvisionInput = {
  name: string;
  slug?: string;
  primaryColor?: string;
  city: string;
  storeName?: string;
  whatsapp?: string | null;
  managerName: string;
  managerEmail: string;
};

export type ProvisionResult =
  | { ok: true; tenant: Tenant; password: string; host: string; domainRegistered: boolean; domainError?: string }
  | { ok: false; error: string };

export function validSlug(slug: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug) && !RESERVED_SLUGS.has(slug);
}

/**
 * "Instala" o tema para um cliente: cria a loja, a primeira unidade, o gestor com senha
 * provisória e os banners padrão, e registra `{slug}.softmotors.com.br` na Vercel.
 * Nenhum deploy: o site existe assim que a linha da loja existe.
 */
export async function provisionTenant(input: ProvisionInput): Promise<ProvisionResult> {
  const slug = slugify(input.slug || input.name).slice(0, 40).replace(/-+$/, "");
  if (!validSlug(slug)) return { ok: false, error: "Endereço inválido ou reservado. Use letras, números e hífen (3 a 40)." };

  const email = input.managerEmail.trim().toLowerCase();
  const [[slugTaken], [emailTaken]] = await Promise.all([
    db.select({ id: tenants.id }).from(tenants).where(eq(tenants.slug, slug)),
    db.select({ id: users.id }).from(users).where(eq(users.email, email)),
  ]);
  if (slugTaken) return { ok: false, error: `O endereço ${platformHost(slug)} já está em uso.` };
  if (emailTaken) return { ok: false, error: "Já existe um usuário com esse e-mail." };

  const color = /^#[0-9a-f]{6}$/i.test(input.primaryColor ?? "") ? input.primaryColor! : "#e3173e";
  const [tenant] = await db
    .insert(tenants)
    .values({ slug, name: input.name.trim(), primaryColor: color, whatsapp: input.whatsapp || null })
    .returning();

  const [store] = await db
    .insert(stores)
    .values({ tenantId: tenant.id, name: input.storeName?.trim() || tenant.name, city: input.city.trim(), whatsapp: input.whatsapp || null })
    .returning();

  const password = tempPassword();
  await db.insert(users).values({
    tenantId: tenant.id,
    storeId: store.id,
    name: input.managerName.trim(),
    email,
    role: "manager",
    passwordHash: await hashPassword(password),
  });

  await db.insert(banners).values(defaultBanners(tenant));

  const host = platformHost(slug);
  const reg = await addDomain(host);
  return { ok: true, tenant, password, host, domainRegistered: reg.ok, domainError: reg.ok ? undefined : reg.error };
}
