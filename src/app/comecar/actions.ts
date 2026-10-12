"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { demoLeads, stores, tenants } from "@/db/schema";
import { onlyDigits } from "@/lib/format";
import { createSandbox, readDemo, readDemoLead, setDemoCookie, setDemoLeadCookie } from "@/lib/sandbox";

export type StartState = { error?: string };

const BLOB_DEMO = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/demo\//;

/**
 * Fim do formulário da demonstração: cria (ou atualiza) a loja de demonstração com a marca
 * do visitante e abre o site dele com o tour.
 */
export async function startDemo(_: StartState, fd: FormData): Promise<StartState> {
  const s = (k: string, max = 80) => String(fd.get(k) ?? "").trim().slice(0, max);
  const contactName = s("contactName");
  const dealership = s("dealership");
  const city = s("city");
  let whatsapp = onlyDigits(s("whatsapp", 30)).slice(0, 13);
  if (whatsapp.length === 10 || whatsapp.length === 11) whatsapp = `55${whatsapp}`;
  const color = /^#[0-9a-f]{6}$/i.test(s("primaryColor", 7)) ? s("primaryColor", 7) : "#ff3916";
  const logo = s("logoUrl", 500);
  const logoUrl = BLOB_DEMO.test(logo) ? logo : null;

  if (fd.get("website")) return { error: "Não foi possível criar a demonstração." };
  if (contactName.length < 2 || dealership.length < 2 || city.length < 2) return { error: "Preencha nome, concessionária e cidade." };
  if (whatsapp.length < 12) return { error: "Informe um WhatsApp com DDD." };

  // Lead da SoftMotors: o da LP (cookie) ou um novo, para quem entrou direto.
  let leadId = await readDemoLead();
  const [lead] = leadId ? await db.select({ id: demoLeads.id }).from(demoLeads).where(eq(demoLeads.id, leadId)) : [];
  if (!lead) {
    const [created] = await db.insert(demoLeads).values({ whatsapp, source: "direto" }).returning({ id: demoLeads.id });
    leadId = created.id;
    await setDemoLeadCookie(leadId);
  }
  await db.update(demoLeads).set({ whatsapp, contactName, dealership, city, primaryColor: color, logoUrl, stage: "started" }).where(eq(demoLeads.id, leadId!));

  // Refazendo o formulário: atualiza a mesma loja em vez de criar outra.
  const current = await readDemo();
  const [existing] = current
    ? await db.select().from(tenants).where(and(eq(tenants.id, current.tenantId), eq(tenants.sandbox, true)))
    : [];
  if (existing && (!existing.expiresAt || existing.expiresAt > new Date())) {
    await db.update(tenants).set({ name: dealership, primaryColor: color, logoUrl, whatsapp }).where(eq(tenants.id, existing.id));
    await db.update(stores).set({ name: dealership, city, whatsapp }).where(eq(stores.tenantId, existing.id));
    await db.update(demoLeads).set({ tenantId: existing.id, stage: "site" }).where(eq(demoLeads.id, leadId!));
    await setDemoCookie(existing.id, leadId!);
  } else {
    const tenant = await createSandbox({ leadId: leadId!, contactName, dealership, whatsapp, city, primaryColor: color, logoUrl });
    await setDemoCookie(tenant.id, leadId!);
  }
  redirect("/?tour=1");
}

/** Guarda o lead assim que o WhatsApp é confirmado (mesmo que a pessoa desista depois). */
export async function captureDemoLead(data: { contactName: string; dealership: string; whatsapp: string }): Promise<number | null> {
  let whatsapp = onlyDigits(data.whatsapp).slice(0, 13);
  if (whatsapp.length === 10 || whatsapp.length === 11) whatsapp = `55${whatsapp}`;
  if (whatsapp.length < 12) return null;
  const values = { whatsapp, contactName: data.contactName.slice(0, 80) || null, dealership: data.dealership.slice(0, 80) || null };
  const leadId = await readDemoLead();
  const [lead] = leadId ? await db.select({ id: demoLeads.id }).from(demoLeads).where(eq(demoLeads.id, leadId)) : [];
  if (lead) {
    await db.update(demoLeads).set(values).where(eq(demoLeads.id, lead.id));
    return lead.id;
  }
  const [created] = await db.insert(demoLeads).values({ ...values, source: "direto" }).returning({ id: demoLeads.id });
  await setDemoLeadCookie(created.id);
  return created.id;
}
