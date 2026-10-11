"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { leadChannel, leads, leadStatus, users, type LeadChannel, type LeadStatus } from "@/db/schema";
import { isManager, requireSession } from "@/lib/auth";
import { onlyDigits } from "@/lib/format";
import { createLead } from "@/lib/leads";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/** Muda status e/ou vendedor. Vendedor só mexe nos próprios leads e não reatribui. */
export async function updateLead(fd: FormData) {
  const s = await requireSession();
  const id = Number(fd.get("id"));
  const status = str(fd, "status") as LeadStatus;
  if (!leadStatus.enumValues.includes(status)) return;

  const patch: { status: LeadStatus; sellerId?: number | null } = { status };
  if (isManager(s) && fd.has("sellerId")) {
    const sellerId = Number(fd.get("sellerId")) || null;
    if (sellerId) {
      const [ok] = await db.select({ id: users.id }).from(users).where(and(eq(users.id, sellerId), eq(users.tenantId, s.tenantId)));
      if (!ok) return;
    }
    patch.sellerId = sellerId;
  }
  await db
    .update(leads)
    .set(patch)
    .where(and(eq(leads.id, id), eq(leads.tenantId, s.tenantId), isManager(s) ? undefined : eq(leads.sellerId, s.user.id)));
  revalidatePath("/torque", "layout");
}

/** Lead que chegou por telefone, na loja ou por outro canal fora do site. */
export async function createManualLead(fd: FormData) {
  const s = await requireSession();
  const name = str(fd, "name");
  let phone = onlyDigits(str(fd, "phone"));
  if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
  const channel = (str(fd, "channel") || "manual") as LeadChannel;
  if (!name || !leadChannel.enumValues.includes(channel)) redirect("/torque/crm/novo?erro=1");

  const { lead } = await createLead({
    tenantId: s.tenantId,
    vehicleId: Number(fd.get("vehicleId")) || null,
    channel,
    name,
    phone: phone || null,
    email: str(fd, "email") || null,
    message: str(fd, "message") || null,
  });
  // Vendedor que registra fica com o próprio lead.
  if (!isManager(s)) await db.update(leads).set({ sellerId: s.user.id }).where(eq(leads.id, lead.id));
  revalidatePath("/torque", "layout");
  redirect("/torque/crm/leads?criado=1");
}
