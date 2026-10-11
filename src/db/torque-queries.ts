import { and, desc, eq, gte, ne, sql } from "drizzle-orm";

import { db } from "./index";
import { leads, listings, marketplaceAccounts, stores, users, vehicles } from "./schema";

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/** Números do Início. `sellerId` restringe os leads ao vendedor logado. */
export async function getHome(tenantId: number, sellerId?: number) {
  const mine = sellerId ? eq(leads.sellerId, sellerId) : undefined;
  const [byChannel, [pending], stock, published, [errors], accounts, [storeCount]] = await Promise.all([
    db
      .select({ channel: leads.channel, n: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), gte(leads.createdAt, startOfMonth()), mine))
      .groupBy(leads.channel),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), eq(leads.status, "new"), mine)),
    db
      .select({ status: vehicles.status, n: sql<number>`count(*)::int` })
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenantId), ne(vehicles.status, "sold")))
      .groupBy(vehicles.status),
    db
      .selectDistinct({ vehicleId: listings.vehicleId })
      .from(listings)
      .innerJoin(vehicles, eq(vehicles.id, listings.vehicleId))
      .where(and(eq(listings.tenantId, tenantId), eq(listings.status, "published"), ne(vehicles.status, "sold"))),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(listings)
      .where(and(eq(listings.tenantId, tenantId), eq(listings.status, "error"))),
    db.select().from(marketplaceAccounts).where(eq(marketplaceAccounts.tenantId, tenantId)),
    db.select({ n: sql<number>`count(*)::int` }).from(stores).where(eq(stores.tenantId, tenantId)),
  ]);

  const activeByPortal = await db
    .select({ marketplace: listings.marketplace, n: sql<number>`count(*)::int` })
    .from(listings)
    .where(and(eq(listings.tenantId, tenantId), eq(listings.status, "published")))
    .groupBy(listings.marketplace);

  const inStock = stock.reduce((s, x) => s + x.n, 0);
  return {
    byChannel,
    leadsMonth: byChannel.reduce((s, x) => s + x.n, 0),
    pending: pending.n,
    inStock,
    reserved: stock.find((s) => s.status === "reserved")?.n ?? 0,
    publishedVehicles: published.length,
    errors: errors.n,
    accounts,
    activeByPortal: Object.fromEntries(activeByPortal.map((a) => [a.marketplace, a.n])) as Record<string, number>,
    stores: storeCount.n,
  };
}

/** Painel do CRM: fila comum por vendedor, atividades do dia e funil. */
export async function getCrm(tenantId: number, sellerId?: number) {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const mine = sellerId ? eq(leads.sellerId, sellerId) : undefined;
  const [queue, waiting, [totals], funnel] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        active: users.active,
        lastAssignedAt: users.lastAssignedAt,
        lastActivity: sql<Date | null>`max(${leads.updatedAt}) filter (where ${leads.status} <> 'new')`,
        fresh: sql<number>`count(${leads.id}) filter (where ${leads.status} = 'new')::int`,
        open: sql<number>`count(${leads.id}) filter (where ${leads.status} = 'in_progress')::int`,
        won: sql<number>`count(${leads.id}) filter (where ${leads.status} = 'won')::int`,
        total: sql<number>`count(${leads.id})::int`,
      })
      .from(users)
      .leftJoin(leads, and(eq(leads.sellerId, users.id), gte(leads.createdAt, since)))
      .where(and(eq(users.tenantId, tenantId), eq(users.role, "seller"), sellerId ? eq(users.id, sellerId) : undefined))
      .groupBy(users.id)
      .orderBy(sql`${users.lastAssignedAt} asc nulls first`, users.id),
    db
      .select({ lead: leads, vehicle: vehicles, seller: users })
      .from(leads)
      .leftJoin(vehicles, eq(vehicles.id, leads.vehicleId))
      .leftJoin(users, eq(users.id, leads.sellerId))
      .where(and(eq(leads.tenantId, tenantId), eq(leads.status, "new"), mine))
      .orderBy(leads.createdAt)
      .limit(8),
    db
      .select({
        fresh: sql<number>`count(*) filter (where ${leads.status} = 'new')::int`,
        open: sql<number>`count(*) filter (where ${leads.status} = 'in_progress')::int`,
      })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), mine)),
    db
      .select({ status: leads.status, n: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(eq(leads.tenantId, tenantId), gte(leads.createdAt, since), mine))
      .groupBy(leads.status),
  ]);
  return { queue, waiting, totals, funnel: Object.fromEntries(funnel.map((f) => [f.status, f.n])) as Record<string, number> };
}

export async function listTeam(tenantId: number) {
  return db
    .select({ user: users, store: stores })
    .from(users)
    .leftJoin(stores, eq(stores.id, users.storeId))
    .where(eq(users.tenantId, tenantId))
    .orderBy(desc(users.role), users.name);
}
