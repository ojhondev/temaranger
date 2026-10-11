/**
 * Dados de demonstração: concessionária "demo" com 2 lojas, 4 vendedores, estoque e leads.
 * Uso: `npm run db:seed`. Não faz nada se o tenant "demo" já existir.
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { eq } from "drizzle-orm";

import { db } from "./index";
import { leads, listings, stores, tenants, users, vehicles, type LeadChannel } from "./schema";
import { slugify } from "../lib/format";
import { createLead } from "../lib/leads";
import { syncVehicle, ALL_MARKETPLACES } from "../lib/marketplaces";

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

const CARS: Array<{
  brand: string; model: string; version: string; year: number; km: number; price: number;
  fipe: number; color: string; transmission: string; fuel: string; body: string; age: number;
  status?: "reserved" | "sold"; store: 0 | 1;
}> = [
  { brand: "Volkswagen", model: "T-Cross", version: "1.0 200 TSI Highline", year: 2022, km: 38000, price: 124900, fipe: 128300, color: "Branco", transmission: "Automático", fuel: "Flex", body: "SUV", age: 4, store: 0 },
  { brand: "Jeep", model: "Compass", version: "2.0 Longitude Diesel 4x4", year: 2021, km: 61000, price: 149900, fipe: 152100, color: "Preto", transmission: "Automático", fuel: "Diesel", body: "SUV", age: 12, store: 0 },
  { brand: "Hyundai", model: "HB20", version: "1.0 Comfort Plus", year: 2020, km: 54000, price: 64900, fipe: 66800, color: "Prata", transmission: "Manual", fuel: "Flex", body: "Hatch", age: 95, store: 0 },
  { brand: "Toyota", model: "Corolla", version: "2.0 XEi", year: 2021, km: 47000, price: 129900, fipe: 131500, color: "Cinza", transmission: "Automático", fuel: "Flex", body: "Sedã", age: 21, store: 0 },
  { brand: "Fiat", model: "Toro", version: "2.0 Volcano Diesel 4x4", year: 2022, km: 52000, price: 154900, fipe: 158900, color: "Vermelho", transmission: "Automático", fuel: "Diesel", body: "Picape", age: 36, store: 0 },
  { brand: "Chevrolet", model: "Onix", version: "1.0 Turbo LTZ", year: 2021, km: 41000, price: 79900, fipe: 81200, color: "Branco", transmission: "Automático", fuel: "Flex", body: "Hatch", age: 64, store: 0 },
  { brand: "Honda", model: "HR-V", version: "1.5 EXL", year: 2020, km: 68000, price: 112900, fipe: 110400, color: "Azul", transmission: "CVT", fuel: "Flex", body: "SUV", age: 8, status: "reserved", store: 0 },
  { brand: "Renault", model: "Kwid", version: "1.0 Zen", year: 2022, km: 29000, price: 52900, fipe: 54300, color: "Laranja", transmission: "Manual", fuel: "Flex", body: "Hatch", age: 2, store: 0 },
  { brand: "Nissan", model: "Kicks", version: "1.6 SV", year: 2021, km: 49000, price: 98900, fipe: 101200, color: "Cinza", transmission: "CVT", fuel: "Flex", body: "SUV", age: 30, status: "sold", store: 0 },
  { brand: "Volkswagen", model: "Nivus", version: "1.0 200 TSI Highline", year: 2023, km: 22000, price: 134900, fipe: 137800, color: "Cinza", transmission: "Automático", fuel: "Flex", body: "SUV", age: 6, store: 1 },
  { brand: "Fiat", model: "Strada", version: "1.3 Volcano CD", year: 2022, km: 45000, price: 99900, fipe: 102300, color: "Branco", transmission: "Manual", fuel: "Flex", body: "Picape", age: 47, store: 1 },
  { brand: "Toyota", model: "Hilux", version: "2.8 SRX 4x4 Diesel", year: 2020, km: 98000, price: 219900, fipe: 224500, color: "Prata", transmission: "Automático", fuel: "Diesel", body: "Picape", age: 120, store: 1 },
  { brand: "Hyundai", model: "Creta", version: "1.6 Action", year: 2022, km: 33000, price: 104900, fipe: 106900, color: "Branco", transmission: "Automático", fuel: "Flex", body: "SUV", age: 15, store: 1 },
  { brand: "Chevrolet", model: "Tracker", version: "1.2 Turbo Premier", year: 2021, km: 57000, price: 109900, fipe: 113600, color: "Preto", transmission: "Automático", fuel: "Flex", body: "SUV", age: 73, store: 1 },
  { brand: "Ford", model: "Ranger", version: "3.2 Limited 4x4 Diesel", year: 2019, km: 112000, price: 169900, fipe: 172800, color: "Cinza", transmission: "Automático", fuel: "Diesel", body: "Picape", age: 58, store: 1 },
  { brand: "Honda", model: "Civic", version: "2.0 EXL", year: 2020, km: 59000, price: 119900, fipe: 122700, color: "Preto", transmission: "CVT", fuel: "Flex", body: "Sedã", age: 3, store: 1 },
  { brand: "Peugeot", model: "208", version: "1.0 Like", year: 2023, km: 18000, price: 74900, fipe: 76900, color: "Vermelho", transmission: "Manual", fuel: "Flex", body: "Hatch", age: 26, status: "sold", store: 1 },
  { brand: "Jeep", model: "Renegade", version: "1.3 Turbo Longitude", year: 2022, km: 36000, price: 117900, fipe: 119800, color: "Verde", transmission: "Automático", fuel: "Flex", body: "SUV", age: 41, store: 1 },
];

const BUYERS = [
  "Mariana Souza", "Carlos Henrique", "Fernanda Lima", "Rafael Oliveira", "Juliana Costa",
  "Bruno Martins", "Patrícia Alves", "Lucas Pereira", "Camila Rocha", "Diego Fernandes",
  "Aline Ribeiro", "Thiago Gomes", "Renata Dias", "Gustavo Barbosa", "Larissa Melo",
  "Eduardo Nunes", "Beatriz Cardoso", "Felipe Teixeira", "Vanessa Moreira", "André Castro",
  "Isabela Freitas", "Rodrigo Pinto", "Natália Araújo", "Marcelo Duarte",
];
const CHANNELS: LeadChannel[] = ["site", "whatsapp", "olx", "webmotors", "mercadolivre", "olx", "whatsapp", "webmotors"];

async function main() {
  const [existing] = await db.select().from(tenants).where(eq(tenants.slug, "demo"));
  if (existing) {
    console.log("Tenant demo já existe — nada a fazer.");
    return;
  }

  const [t] = await db
    .insert(tenants)
    .values({ slug: "demo", name: "Rota Veículos", primaryColor: "#dc2626", whatsapp: "5544999990000" })
    .returning();

  const [mga, lda] = await db
    .insert(stores)
    .values([
      { tenantId: t.id, name: "Rota Maringá", city: "Maringá - PR", address: "Av. Colombo, 5000", whatsapp: "5544999990001" },
      { tenantId: t.id, name: "Rota Londrina", city: "Londrina - PR", address: "Av. Tiradentes, 1200", whatsapp: "5543999990002" },
    ])
    .returning();

  await db.insert(users).values([
    { tenantId: t.id, name: "Ricardo Mendes", email: "gestor@rotaveiculos.demo", role: "manager" },
    { tenantId: t.id, storeId: mga.id, name: "Ana Paula", phone: "5544999991001" },
    { tenantId: t.id, storeId: mga.id, name: "João Victor", phone: "5544999991002" },
    { tenantId: t.id, storeId: lda.id, name: "Paulo Santos", phone: "5543999991003" },
    { tenantId: t.id, storeId: lda.id, name: "Larissa Prado", phone: "5543999991004" },
  ]);

  const created = [];
  for (const c of CARS) {
    const [v] = await db
      .insert(vehicles)
      .values({
        tenantId: t.id,
        storeId: c.store === 0 ? mga.id : lda.id,
        slug: slugify(`${c.brand} ${c.model} ${c.version} ${c.year}`),
        brand: c.brand, model: c.model, version: c.version, year: c.year, km: c.km,
        price: c.price, fipePrice: c.fipe, color: c.color, transmission: c.transmission,
        fuel: c.fuel, bodyType: c.body, status: c.status ?? "available",
        description: `${c.brand} ${c.model} ${c.version}, revisado, laudo cautelar aprovado e garantia de 3 meses.`,
        stockedAt: daysAgo(c.age),
        soldAt: c.status === "sold" ? daysAgo(1) : null,
      })
      .returning();
    created.push(v);
    // A maioria vai para os 3 portais; os mais baratos ficam fora da WebMotors.
    await db.insert(listings).values(
      ALL_MARKETPLACES.map((m) => ({
        tenantId: t.id,
        vehicleId: v.id,
        marketplace: m,
        enabled: !(m === "webmotors" && c.price < 70000),
      })),
    );
    await syncVehicle(t.id, v.id);
  }

  for (let i = 0; i < BUYERS.length; i++) {
    const v = created[(i * 7) % created.length];
    const channel = CHANNELS[i % CHANNELS.length];
    const { lead } = await createLead({
      tenantId: t.id,
      vehicleId: v.id,
      channel,
      name: BUYERS[i],
      phone: `55449${String(88000000 + i * 1371).slice(0, 8)}`,
      message: channel === "site" ? "Tenho interesse, aceita troca?" : null,
    });
    const status = i < 8 ? "new" : i < 16 ? "in_progress" : i % 2 ? "won" : "lost";
    await db.update(leads).set({ status, createdAt: daysAgo(Math.floor(i * 1.2)) }).where(eq(leads.id, lead.id));
  }

  console.log(`Seed ok: tenant ${t.slug}, ${created.length} veículos, ${BUYERS.length} leads.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
