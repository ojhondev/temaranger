import { eq } from "drizzle-orm";

import { db } from "@/db";
import { demoLeads, tenants } from "@/db/schema";
import { readDemo, readDemoLead } from "@/lib/sandbox";

import { Wizard } from "./wizard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Monte o site da sua concessionária",
  description: "Veja em tempo real como fica o site da sua loja com a sua marca, e teste o painel Torque.",
  robots: { index: false },
};

/** Formulário da demonstração em tempo real (demo.softmotors.com.br). */
export default async function Comecar() {
  const leadId = await readDemoLead();
  const [lead] = leadId ? await db.select().from(demoLeads).where(eq(demoLeads.id, leadId)) : [];
  const demo = await readDemo();
  const [current] = demo ? await db.select({ id: tenants.id, name: tenants.name, expiresAt: tenants.expiresAt }).from(tenants).where(eq(tenants.id, demo.tenantId)) : [];
  const active = current && (!current.expiresAt || current.expiresAt > new Date()) ? current.name : null;

  return (
    <Wizard
      initial={{
        contactName: lead?.contactName ?? "",
        dealership: lead?.dealership ?? "",
        whatsapp: lead?.whatsapp?.replace(/^55/, "") ?? "",
        city: lead?.city ?? "",
        primaryColor: lead?.primaryColor ?? "#ff3916",
        logoUrl: lead?.logoUrl ?? "",
      }}
      leadId={lead?.id ?? null}
      activeDemo={active}
    />
  );
}
