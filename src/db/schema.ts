import {
  boolean,
  index,
  integer,
  jsonb,
  pgSchema,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Todas as tabelas do produto vivem no schema `app` do Postgres. */
export const app = pgSchema("app");

export const userRole = app.enum("user_role", ["manager", "seller"]);
export const vehicleStatus = app.enum("vehicle_status", ["available", "reserved", "sold"]);
export const marketplace = app.enum("marketplace", ["olx", "webmotors", "mercadolivre"]);
export const listingStatus = app.enum("listing_status", ["published", "paused", "removed", "error"]);
export const leadChannel = app.enum("lead_channel", [
  "site",
  "whatsapp",
  "olx",
  "webmotors",
  "mercadolivre",
  "manual",
]);
export const vehicleType = app.enum("vehicle_type", ["car", "moto"]);
export const leadStatus = app.enum("lead_status", ["new", "in_progress", "won", "lost"]);

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Uma concessionária cliente. */
export const tenants = app.table("tenants", {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  domain: text().unique(),
  logoUrl: text(),
  primaryColor: text().notNull().default("#e3173e"),
  whatsapp: text(),
  ...timestamps,
});

/** Loja (unidade) de uma concessionária. */
export const stores = app.table(
  "stores",
  {
    id: serial().primaryKey(),
    tenantId: integer()
      .notNull()
      .references(() => tenants.id),
    name: text().notNull(),
    city: text().notNull(),
    address: text(),
    whatsapp: text(),
    ...timestamps,
  },
  (t) => [index().on(t.tenantId)],
);

/** Gestores e vendedores. */
export const users = app.table(
  "users",
  {
    id: serial().primaryKey(),
    tenantId: integer()
      .notNull()
      .references(() => tenants.id),
    storeId: integer().references(() => stores.id),
    name: text().notNull(),
    email: text(),
    phone: text(),
    role: userRole().notNull().default("seller"),
    active: boolean().notNull().default(true),
    /** Usado pelo rodízio: recebe o próximo lead quem está há mais tempo sem receber. */
    lastAssignedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [index().on(t.tenantId)],
);

export const vehicles = app.table(
  "vehicles",
  {
    id: serial().primaryKey(),
    tenantId: integer()
      .notNull()
      .references(() => tenants.id),
    storeId: integer()
      .notNull()
      .references(() => stores.id),
    slug: text().notNull(),
    plate: text(),
    brand: text().notNull(),
    model: text().notNull(),
    version: text(),
    type: vehicleType().notNull().default("car"),
    /** Ano de fabricação. */
    year: integer().notNull(),
    yearModel: integer(),
    km: integer().notNull().default(0),
    /** Valores em reais inteiros. */
    price: integer().notNull(),
    fipePrice: integer(),
    color: text(),
    transmission: text(),
    fuel: text(),
    bodyType: text(),
    description: text(),
    photos: jsonb().$type<string[]>().notNull().default([]),
    /** Itens/opcionais do veículo (Airbag, Freio ABS…). */
    optionals: jsonb().$type<string[]>().notNull().default([]),
    acceptsTrade: boolean().notNull().default(true),
    factoryWarranty: boolean().notNull().default(false),
    hasHistoryReport: boolean().notNull().default(false),
    /** Destaque pago/curado: aparece primeiro e com selo "Destaque". */
    featured: boolean().notNull().default(false),
    /** Selo de campanha exibido no card (ex.: "Festival de carros"). */
    tag: text(),
    status: vehicleStatus().notNull().default("available"),
    /** Data de entrada no estoque, base do "carro parado". */
    stockedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    soldAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex().on(t.tenantId, t.slug), index().on(t.tenantId, t.status)],
);

/** Anúncio de um veículo em um marketplace. */
export const listings = app.table(
  "listings",
  {
    id: serial().primaryKey(),
    tenantId: integer()
      .notNull()
      .references(() => tenants.id),
    vehicleId: integer()
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    marketplace: marketplace().notNull(),
    enabled: boolean().notNull().default(true),
    status: listingStatus().notNull().default("removed"),
    externalId: text(),
    syncedAt: timestamp({ withTimezone: true }),
    lastError: text(),
    ...timestamps,
  },
  (t) => [uniqueIndex().on(t.vehicleId, t.marketplace), index().on(t.tenantId)],
);

export const leads = app.table(
  "leads",
  {
    id: serial().primaryKey(),
    tenantId: integer()
      .notNull()
      .references(() => tenants.id),
    vehicleId: integer().references(() => vehicles.id, { onDelete: "set null" }),
    sellerId: integer().references(() => users.id),
    name: text().notNull(),
    phone: text(),
    email: text(),
    message: text(),
    /** Aceitou receber contatos da loja por e-mail/WhatsApp. */
    marketingOptIn: boolean().notNull().default(false),
    channel: leadChannel().notNull(),
    status: leadStatus().notNull().default("new"),
    ...timestamps,
  },
  (t) => [index().on(t.tenantId, t.createdAt), index().on(t.sellerId)],
);

export type Tenant = typeof tenants.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Marketplace = (typeof marketplace.enumValues)[number];
export type LeadChannel = (typeof leadChannel.enumValues)[number];
export type LeadStatus = (typeof leadStatus.enumValues)[number];
export type VehicleType = (typeof vehicleType.enumValues)[number];
export type VehicleStatus = (typeof vehicleStatus.enumValues)[number];
