import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { demoLeads, tenants, users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { originOf, readDemo } from "@/lib/sandbox";

/** "Conhecer o Torque" na demonstração: entra direto como gestor da loja de demonstração. */
export async function GET(req: Request) {
  const demo = await readDemo();
  const origin = originOf(req);
  const home = new URL("/comecar", origin);
  if (!demo) return NextResponse.redirect(home);
  const [tenant] = await db.select().from(tenants).where(and(eq(tenants.id, demo.tenantId), eq(tenants.sandbox, true)));
  const [manager] = tenant ? await db.select().from(users).where(and(eq(users.tenantId, tenant.id), eq(users.role, "manager"))) : [];
  if (!manager) return NextResponse.redirect(home);
  await createSession(manager.id);
  await db.update(demoLeads).set({ stage: "torque", torqueOpenedAt: new Date() }).where(eq(demoLeads.id, demo.leadId));
  return NextResponse.redirect(new URL("/torque", origin));
}
