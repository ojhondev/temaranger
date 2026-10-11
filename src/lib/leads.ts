import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { leads, users, vehicles, type LeadChannel } from "@/db/schema";

/**
 * Rodízio: entrega o lead ao vendedor ativo da loja que está há mais tempo sem receber.
 * Sem vendedor na loja, cai no rodízio da concessionária inteira.
 */
export async function nextSeller(tenantId: number, storeId: number | null) {
  const pick = async (byStore: boolean) => {
    const [s] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.role, "seller"),
          eq(users.active, true),
          byStore && storeId ? eq(users.storeId, storeId) : undefined,
        ),
      )
      .orderBy(sql`${users.lastAssignedAt} asc nulls first`, asc(users.id))
      .limit(1);
    return s;
  };
  const seller = (await pick(true)) ?? (await pick(false));
  if (seller) {
    await db.update(users).set({ lastAssignedAt: new Date() }).where(eq(users.id, seller.id));
  }
  return seller ?? null;
}

export async function createLead(input: {
  tenantId: number;
  vehicleId?: number | null;
  channel: LeadChannel;
  name: string;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
}) {
  let storeId: number | null = null;
  if (input.vehicleId) {
    const [v] = await db
      .select({ storeId: vehicles.storeId })
      .from(vehicles)
      .where(and(eq(vehicles.id, input.vehicleId), eq(vehicles.tenantId, input.tenantId)));
    storeId = v?.storeId ?? null;
  }
  const seller = await nextSeller(input.tenantId, storeId);
  const [lead] = await db
    .insert(leads)
    .values({ ...input, vehicleId: input.vehicleId ?? null, sellerId: seller?.id ?? null })
    .returning();
  return { lead, seller };
}
