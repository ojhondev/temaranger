import { randomBytes } from "node:crypto";

import { and, eq, lt, ne } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { db } from "@/db";
import {
  banners,
  demoLeads,
  leads,
  listings,
  marketplaceAccounts,
  stores,
  tenants,
  users,
  vehicles,
  type LeadChannel,
  type LeadStatus,
} from "@/db/schema";

import { sessionKey } from "./session-key";
import { ALL_MARKETPLACES } from "./marketplaces";
import { hashPassword } from "./password";
import { PLATFORM_DOMAIN } from "./platform";
import { defaultBanners } from "./provision";

/**
 * Demonstração em tempo real (demo.softmotors.com.br): cada visitante ganha uma loja
 * "sandbox" de verdade, copiada do template com a marca dele, que expira em 7 dias.
 */
export const DEMO_DAYS = 7;
export const DEMO_COOKIE = "sm_demo";
export const DEMO_LEAD_COOKIE = "sm_demo_lead";
/** Veículos que o visitante pode cadastrar na demonstração. */
export const DEMO_VEHICLE_LIMIT = 1;
export const TEMPLATE_SLUG = "template";

export const isDemoHost = (host: string) => host === `demo.${PLATFORM_DOMAIN}` || host === "demo.localhost";

const cookieBase = { httpOnly: true, sameSite: "lax" as const, path: "/", secure: process.env.NODE_ENV === "production" };

async function sign(payload: Record<string, number>, days: number) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${days}d`).sign(sessionKey());
}

async function verify(token: string | undefined) {
  if (!token) return null;
  try {
    return (await jwtVerify(token, sessionKey())).payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Lead capturado na LP (antes do formulário). */
export async function setDemoLeadCookie(leadId: number) {
  (await cookies()).set(DEMO_LEAD_COOKIE, await sign({ lid: leadId }, 30), { ...cookieBase, maxAge: 30 * 86_400 });
}

export async function readDemoLead() {
  const p = await verify((await cookies()).get(DEMO_LEAD_COOKIE)?.value);
  return typeof p?.lid === "number" ? p.lid : null;
}

export async function setDemoCookie(tenantId: number, leadId: number) {
  (await cookies()).set(DEMO_COOKIE, await sign({ tid: tenantId, lid: leadId }, DEMO_DAYS), { ...cookieBase, maxAge: DEMO_DAYS * 86_400 });
}

/** Demonstração deste visitante: `{ tenantId, leadId }` ou null. */
export async function readDemo() {
  const p = await verify((await cookies()).get(DEMO_COOKIE)?.value);
  return typeof p?.tid === "number" && typeof p.lid === "number" ? { tenantId: p.tid, leadId: p.lid } : null;
}

export async function clearDemo() {
  (await cookies()).delete(DEMO_COOKIE);
}

export type SandboxInput = { leadId: number; contactName: string; dealership: string; whatsapp: string; city: string; primaryColor: string; logoUrl: string | null };

const SAMPLE_LEADS: { name: string; channel: LeadChannel; status: LeadStatus; message: string; hoursAgo: number }[] = [
  { name: "Mariana Costa", channel: "site", status: "new", message: "Olá, tenho interesse no veículo. Aceita troca?", hoursAgo: 1 },
  { name: "Rafael Lima", channel: "olx", status: "new", message: "Qual o menor valor à vista?", hoursAgo: 3 },
  { name: "Juliana Prado", channel: "whatsapp", status: "in_progress", message: "Quer agendar uma visita no sábado.", hoursAgo: 20 },
  { name: "Carlos Mendes", channel: "webmotors", status: "in_progress", message: "Pediu simulação em 48x.", hoursAgo: 30 },
  { name: "Fernanda Alves", channel: "mercadolivre", status: "won", message: "Fechou negócio com entrada + financiamento.", hoursAgo: 72 },
  { name: "Bruno Rocha", channel: "site", status: "lost", message: "Comprou em outra loja.", hoursAgo: 120 },
];

/**
 * Cria a loja de demonstração: copia o estoque do template, aplica a marca do visitante e
 * coloca o próprio visitante como vendedor, para os leads de teste chegarem no WhatsApp dele.
 */
export async function createSandbox(input: SandboxInput) {
  const [template] = await db.select().from(tenants).where(eq(tenants.slug, TEMPLATE_SLUG));
  if (!template) throw new Error("Loja template não encontrada.");

  const slug = `demo-${randomBytes(5).toString("hex")}`;
  const { faviconUrl: _favicon, popup: _popup, topBar: _bar, ...settings } = template.settings ?? {};
  const [tenant] = await db
    .insert(tenants)
    .values({
      slug,
      name: input.dealership,
      primaryColor: input.primaryColor,
      logoUrl: input.logoUrl,
      whatsapp: input.whatsapp,
      settings: { ...settings, seoTitle: undefined, seoDescription: undefined },
      sandbox: true,
      expiresAt: new Date(Date.now() + DEMO_DAYS * 86_400_000),
    })
    .returning();

  const [store] = await db.insert(stores).values({ tenantId: tenant.id, name: input.dealership, city: input.city, whatsapp: input.whatsapp }).returning();

  // Gestor (entra no Torque pela demonstração, sem senha conhecida) e o próprio visitante como vendedor.
  const firstName = input.contactName.split(" ")[0] || "Você";
  await db.insert(users).values([
    { tenantId: tenant.id, storeId: store.id, name: input.contactName || "Gestor", role: "manager", phone: input.whatsapp, passwordHash: await hashPassword(randomBytes(24).toString("hex")) },
    { tenantId: tenant.id, storeId: store.id, name: `${firstName} (você)`, role: "seller", phone: input.whatsapp },
  ]);
  const [seller] = await db.select().from(users).where(and(eq(users.tenantId, tenant.id), eq(users.role, "seller")));

  const source = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.tenantId, template.id), ne(vehicles.status, "sold")))
    .limit(24);
  const copied = source.length
    ? await db
        .insert(vehicles)
        .values(source.map(({ id: _id, createdAt: _c, updatedAt: _u, ...v }) => ({ ...v, tenantId: tenant.id, storeId: store.id })))
        .returning({ id: vehicles.id })
    : [];
  if (copied.length) {
    await db.insert(listings).values(copied.flatMap((v) => ALL_MARKETPLACES.map((m) => ({ tenantId: tenant.id, vehicleId: v.id, marketplace: m, enabled: false }))));
    await db.insert(leads).values(
      SAMPLE_LEADS.map((l, i) => ({
        tenantId: tenant.id,
        vehicleId: copied[i % copied.length].id,
        sellerId: seller.id,
        name: l.name,
        phone: null,
        message: l.message,
        channel: l.channel,
        status: l.status,
        createdAt: new Date(Date.now() - l.hoursAgo * 3_600_000),
      })),
    );
  }
  await db.insert(banners).values(defaultBanners(tenant));
  await db.update(demoLeads).set({ tenantId: tenant.id, stage: "site" }).where(eq(demoLeads.id, input.leadId));
  return tenant;
}

/** Apaga as demonstrações vencidas (tudo o que pertence à loja sandbox). */
export async function purgeExpiredSandboxes() {
  const expired = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.sandbox, true), lt(tenants.expiresAt, new Date())));
  for (const { id } of expired) {
    await db.update(demoLeads).set({ tenantId: null }).where(eq(demoLeads.tenantId, id));
    await db.delete(leads).where(eq(leads.tenantId, id));
    await db.delete(listings).where(eq(listings.tenantId, id));
    await db.delete(vehicles).where(eq(vehicles.tenantId, id));
    await db.delete(banners).where(eq(banners.tenantId, id));
    await db.delete(marketplaceAccounts).where(eq(marketplaceAccounts.tenantId, id));
    await db.delete(users).where(eq(users.tenantId, id));
    await db.delete(stores).where(eq(stores.tenantId, id));
    await db.delete(tenants).where(and(eq(tenants.id, id), eq(tenants.sandbox, true)));
  }
  return expired.length;
}

/** Quantos veículos o visitante ainda pode cadastrar na demonstração (null = loja normal). */
export async function demoVehiclesLeft(tenantId: number) {
  const [t] = await db.select({ sandbox: tenants.sandbox }).from(tenants).where(eq(tenants.id, tenantId));
  if (!t?.sandbox) return null;
  const [lead] = await db.select({ added: demoLeads.vehiclesAdded }).from(demoLeads).where(eq(demoLeads.tenantId, tenantId));
  return Math.max(0, DEMO_VEHICLE_LIMIT - (lead?.added ?? 0));
}

export async function countDemoVehicle(tenantId: number) {
  const [lead] = await db.select().from(demoLeads).where(eq(demoLeads.tenantId, tenantId));
  if (lead) await db.update(demoLeads).set({ vehiclesAdded: lead.vehiclesAdded + 1 }).where(eq(demoLeads.id, lead.id));
}

/** Endereço público da requisição (o `req.url` do Next pode trazer outro host em dev). */
export function originOf(req: Request) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? new URL(req.url).host;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.includes(".localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
