import { and, asc, desc, eq, gte, ilike, lte, ne, or, sql, type SQL } from "drizzle-orm";

import { db } from "./index";
import { leads, listings, stores, users, vehicles } from "./schema";

export type StockFilters = {
  /** "carros" (padrão) ou "motos". */
  tipo?: string;
  q?: string;
  cidade?: string;
  marca?: string;
  modelo?: string;
  carroceria?: string;
  cambio?: string;
  loja?: string;
  anoMin?: string;
  anoMax?: string;
  precoMin?: string;
  precoMax?: string;
  kmMax?: string;
  ordem?: string;
};

const num = (v?: string) => {
  const n = Number((v ?? "").replace(/\D/g, ""));
  return v && Number.isFinite(n) && n > 0 ? n : null;
};

/** Estoque público: só disponíveis e reservados; destaques primeiro. */
export async function listPublicVehicles(tenantId: number, f: StockFilters = {}, limit = 60) {
  const where: (SQL | undefined)[] = [
    eq(vehicles.tenantId, tenantId),
    ne(vehicles.status, "sold"),
    eq(vehicles.type, f.tipo === "motos" ? "moto" : "car"),
  ];
  if (f.marca) where.push(ilike(vehicles.brand, f.marca));
  if (f.modelo) where.push(ilike(vehicles.model, f.modelo));
  if (f.carroceria) where.push(eq(vehicles.bodyType, f.carroceria));
  if (f.cambio) where.push(eq(vehicles.transmission, f.cambio));
  if (f.loja) where.push(eq(vehicles.storeId, Number(f.loja)));
  if (f.cidade) where.push(ilike(stores.city, `%${f.cidade.trim()}%`));
  const [anoMin, anoMax, precoMin, precoMax, kmMax] = [f.anoMin, f.anoMax, f.precoMin, f.precoMax, f.kmMax].map(num);
  if (anoMin) where.push(gte(vehicles.year, anoMin));
  if (anoMax) where.push(lte(vehicles.year, anoMax));
  if (precoMin) where.push(gte(vehicles.price, precoMin));
  if (precoMax) where.push(lte(vehicles.price, precoMax));
  if (kmMax) where.push(lte(vehicles.km, kmMax));
  if (f.q) {
    const term = `%${f.q.trim()}%`;
    where.push(or(ilike(vehicles.brand, term), ilike(vehicles.model, term), ilike(vehicles.version, term)));
  }
  const order =
    f.ordem === "menor-preco"
      ? [asc(vehicles.price)]
      : f.ordem === "maior-preco"
        ? [desc(vehicles.price)]
        : f.ordem === "menor-km"
          ? [asc(vehicles.km)]
          : f.ordem === "recentes"
            ? [desc(vehicles.stockedAt)]
            : f.ordem === "mais-novos"
            ? [desc(vehicles.year)]
            : [desc(vehicles.featured), desc(vehicles.stockedAt)];

  return db
    .select({ vehicle: vehicles, store: stores })
    .from(vehicles)
    .innerJoin(stores, eq(stores.id, vehicles.storeId))
    .where(and(...where))
    .orderBy(...order)
    .limit(limit);
}

/** Um card por modelo (o mais recente), para "Modelos mais buscados". */
export async function listModels(tenantId: number) {
  const rows = await db
    .select({ vehicle: vehicles })
    .from(vehicles)
    .where(and(eq(vehicles.tenantId, tenantId), ne(vehicles.status, "sold"), eq(vehicles.type, "car")))
    .orderBy(desc(vehicles.featured), desc(vehicles.stockedAt));
  const seen = new Set<string>();
  return rows
    .map((r) => r.vehicle)
    .filter((v) => {
      const key = `${v.brand}|${v.model}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Contagem por carroceria e lista de câmbios, para filtros e "Tipos de carroceria". */
export async function getFacets(tenantId: number) {
  const base = and(eq(vehicles.tenantId, tenantId), ne(vehicles.status, "sold"));
  const [bodies, transmissions, cities] = await Promise.all([
    db
      .select({ body: vehicles.bodyType, total: sql<number>`count(*)::int` })
      .from(vehicles)
      .where(and(base, eq(vehicles.type, "car")))
      .groupBy(vehicles.bodyType),
    db.selectDistinct({ t: vehicles.transmission }).from(vehicles).where(base),
    db.selectDistinct({ city: stores.city }).from(stores).where(eq(stores.tenantId, tenantId)),
  ]);
  return {
    bodies: Object.fromEntries(bodies.map((b) => [b.body ?? "", b.total])),
    transmissions: transmissions.map((t) => t.t).filter(Boolean) as string[],
    cities: cities.map((c) => c.city),
  };
}

export async function listSimilar(tenantId: number, v: { id: number; bodyType: string | null; type: "car" | "moto" }) {
  return db
    .select({ vehicle: vehicles, store: stores })
    .from(vehicles)
    .innerJoin(stores, eq(stores.id, vehicles.storeId))
    .where(
      and(
        eq(vehicles.tenantId, tenantId),
        ne(vehicles.status, "sold"),
        ne(vehicles.id, v.id),
        eq(vehicles.type, v.type),
        v.bodyType ? eq(vehicles.bodyType, v.bodyType) : undefined,
      ),
    )
    .orderBy(desc(vehicles.stockedAt))
    .limit(12);
}

export async function getPublicVehicle(tenantId: number, slug: string) {
  const [row] = await db
    .select({ vehicle: vehicles, store: stores })
    .from(vehicles)
    .innerJoin(stores, eq(stores.id, vehicles.storeId))
    .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.slug, slug)));
  return row;
}

export async function listBrands(tenantId: number, type: "car" | "moto" = "car") {
  const rows = await db
    .selectDistinct({ brand: vehicles.brand })
    .from(vehicles)
    .where(and(eq(vehicles.tenantId, tenantId), ne(vehicles.status, "sold"), eq(vehicles.type, type)))
    .orderBy(asc(vehicles.brand));
  return rows.map((r) => r.brand);
}

export function listStores(tenantId: number) {
  return db.select().from(stores).where(eq(stores.tenantId, tenantId)).orderBy(asc(stores.id));
}

export function listSellers(tenantId: number) {
  return db
    .select()
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.role, "seller")))
    .orderBy(asc(users.id));
}

/** Estoque do painel, com os anúncios de cada veículo. */
export async function listAdminVehicles(tenantId: number) {
  const [rows, ls] = await Promise.all([
    db
      .select({ vehicle: vehicles, store: stores })
      .from(vehicles)
      .innerJoin(stores, eq(stores.id, vehicles.storeId))
      .where(eq(vehicles.tenantId, tenantId))
      .orderBy(asc(vehicles.stockedAt)),
    db.select().from(listings).where(eq(listings.tenantId, tenantId)),
  ]);
  return rows.map((r) => ({ ...r, listings: ls.filter((l) => l.vehicleId === r.vehicle.id) }));
}

export async function getAdminVehicle(tenantId: number, id: number) {
  const [v] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, id)));
  if (!v) return null;
  const ls = await db.select().from(listings).where(eq(listings.vehicleId, v.id));
  return { vehicle: v, listings: ls };
}

export type LeadFilters = { status?: string; vendedor?: string; canal?: string };

export async function listLeads(tenantId: number, f: LeadFilters = {}, onlySellerId?: number) {
  const where: (SQL | undefined)[] = [eq(leads.tenantId, tenantId)];
  if (onlySellerId) where.push(eq(leads.sellerId, onlySellerId));
  if (f.status) where.push(sql`${leads.status} = ${f.status}`);
  if (f.canal) where.push(sql`${leads.channel} = ${f.canal}`);
  if (f.vendedor) where.push(eq(leads.sellerId, Number(f.vendedor)));
  return db
    .select({ lead: leads, vehicle: vehicles, seller: users })
    .from(leads)
    .leftJoin(vehicles, eq(vehicles.id, leads.vehicleId))
    .leftJoin(users, eq(users.id, leads.sellerId))
    .where(and(...where))
    .orderBy(desc(leads.createdAt))
    .limit(200);
}

/** Números do painel do dono (últimos 30 dias para leads). */
export async function getDashboard(tenantId: number) {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const recent = and(eq(leads.tenantId, tenantId), gte(leads.createdAt, since));

  const [byChannel, bySeller, stock, totals] = await Promise.all([
    db
      .select({ channel: leads.channel, total: sql<number>`count(*)::int` })
      .from(leads)
      .where(recent)
      .groupBy(leads.channel)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({
        name: users.name,
        total: sql<number>`count(*)::int`,
        won: sql<number>`count(*) filter (where ${leads.status} = 'won')::int`,
        open: sql<number>`count(*) filter (where ${leads.status} = 'new')::int`,
      })
      .from(leads)
      .innerJoin(users, eq(users.id, leads.sellerId))
      .where(recent)
      .groupBy(users.name)
      .orderBy(desc(sql`count(*)`)),
    db
      .select({ vehicle: vehicles })
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenantId), ne(vehicles.status, "sold")))
      .orderBy(asc(vehicles.stockedAt)),
    db
      .select({
        leads: sql<number>`count(*)::int`,
        fresh: sql<number>`count(*) filter (where ${leads.status} = 'new')::int`,
        won: sql<number>`count(*) filter (where ${leads.status} = 'won')::int`,
      })
      .from(leads)
      .where(recent),
  ]);

  return { byChannel, bySeller, stock: stock.map((s) => s.vehicle), totals: totals[0] };
}
