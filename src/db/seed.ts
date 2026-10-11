/**
 * Dados de demonstração do tema Ranger: concessionária "demo" em São Paulo, 2 lojas,
 * 4 vendedores, estoque de carros e motos e leads.
 * Uso: `npm run db:seed`. Não faz nada se o tenant "demo" já existir.
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

import { eq } from "drizzle-orm";

import { db } from "./index";
import { leads, listings, stores, tenants, users, vehicles, type LeadChannel } from "./schema";
import { slugify } from "../lib/format";
import { createLead } from "../lib/leads";
import { ALL_MARKETPLACES, syncVehicle } from "../lib/marketplaces";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000);

const BASE = [
  "Airbag", "Alarme", "Ar quente", "Computador de bordo", "Controle de tração",
  "Desembaçador traseiro", "Encosto de cabeça traseiro", "Freio ABS", "Limpador traseiro",
  "Travas elétricas", "Vidros elétricos", "Volante com regulagem de altura",
];
const PLUS = [
  "Ar-condicionado", "Direção elétrica", "Retrovisores elétricos", "Rodas de liga leve",
  "Controle automático de velocidade", "Câmera de ré", "Sensor de estacionamento",
  "Central multimídia", "Bluetooth",
];
const TOP = [
  "Bancos em couro", "GPS", "Chave inteligente/presencial", "Botão de ignição/Start button",
  "Teto solar", "Faróis de LED", "Ar-condicionado digital",
];
const pack = (level: 1 | 2 | 3) => [...BASE, ...(level > 1 ? PLUS : []), ...(level > 2 ? TOP : [])];

type Seed = {
  brand: string; model: string; version: string; year: number; yearModel?: number; km: number;
  price: number; fipe: number; color: string; transmission: string; fuel: string; body: string;
  hours: number; store: 0 | 1; level: 1 | 2 | 3; type?: "moto"; status?: "reserved" | "sold";
  featured?: boolean; tag?: string; warranty?: boolean; history?: boolean;
};

const FEST = "Festival de carros";

const STOCK: Seed[] = [
  { brand: "Jeep", model: "Avenger", version: "1.0 T200 Turbo MHEV Altitude CVT", year: 2026, yearModel: 2027, km: 0, price: 116900, fipe: 118500, color: "Cinza", transmission: "CVT", fuel: "Gasolina e elétrico", body: "SUV", hours: 1, store: 0, level: 3, featured: true, warranty: true, history: true },
  { brand: "Renault", model: "Kwid", version: "1.0 Zen", year: 2023, km: 21000, price: 61490, fipe: 63100, color: "Branco", transmission: "Manual", fuel: "Flex", body: "Hatch", hours: 2, store: 0, level: 1, tag: FEST, history: true },
  { brand: "Hyundai", model: "Creta", version: "Comfort 1.0 TB 12V Flex Aut", year: 2026, km: 0, price: 137890, fipe: 139900, color: "Branco", transmission: "Automático", fuel: "Flex", body: "SUV", hours: 3, store: 1, level: 3, featured: true, tag: FEST, warranty: true },
  { brand: "Volkswagen", model: "Polo", version: "1.0 MPI Flex 12V 5P", year: 2023, km: 28000, price: 73290, fipe: 75400, color: "Prata", transmission: "Manual", fuel: "Flex", body: "Hatch", hours: 4, store: 0, level: 2, tag: FEST },
  { brand: "Honda", model: "City Hatchback", version: "LX 1.5 Flex 16V Aut.", year: 2024, km: 15000, price: 106490, fipe: 108900, color: "Cinza", transmission: "CVT", fuel: "Flex", body: "Hatch", hours: 5, store: 1, level: 2, tag: FEST, warranty: true },
  { brand: "Honda", model: "HR-V", version: "1.5 Turbo Touring CVT", year: 2023, km: 32000, price: 164900, fipe: 168300, color: "Vermelho", transmission: "CVT", fuel: "Flex", body: "SUV", hours: 7, store: 0, level: 3, history: true },
  { brand: "Jeep", model: "Compass", version: "2.0 Longitude Diesel 4x4", year: 2022, km: 61000, price: 149900, fipe: 152100, color: "Prata", transmission: "Automático", fuel: "Diesel", body: "SUV", hours: 9, store: 0, level: 3 },
  { brand: "Volkswagen", model: "T-Cross", version: "1.0 200 TSI Highline", year: 2023, km: 38000, price: 129900, fipe: 133300, color: "Preto", transmission: "Automático", fuel: "Flex", body: "SUV", hours: 12, store: 1, level: 3, tag: FEST },
  { brand: "Jeep", model: "Renegade", version: "1.3 Turbo Longitude", year: 2022, km: 36000, price: 117900, fipe: 119800, color: "Cinza", transmission: "Automático", fuel: "Flex", body: "SUV", hours: 20, store: 1, level: 2 },
  { brand: "Toyota", model: "Hilux SW4", version: "2.8 SRX 4x4 Diesel 7L", year: 2021, km: 88000, price: 289900, fipe: 296500, color: "Branco", transmission: "Automático", fuel: "Diesel", body: "SUV", hours: 30, store: 0, level: 3, history: true },
  { brand: "Toyota", model: "Corolla", version: "2.0 XEi", year: 2022, km: 47000, price: 134900, fipe: 136500, color: "Cinza", transmission: "CVT", fuel: "Flex", body: "Sedã", hours: 40, store: 0, level: 3 },
  { brand: "Chevrolet", model: "Onix", version: "1.0 Turbo LTZ", year: 2022, km: 41000, price: 82900, fipe: 84200, color: "Branco", transmission: "Automático", fuel: "Flex", body: "Hatch", hours: 52, store: 1, level: 2, tag: FEST },
  { brand: "Fiat", model: "Toro", version: "2.0 Volcano Diesel 4x4", year: 2022, km: 52000, price: 154900, fipe: 158900, color: "Vermelho", transmission: "Automático", fuel: "Diesel", body: "Picape", hours: 70, store: 0, level: 3 },
  { brand: "Fiat", model: "Strada", version: "1.3 Volcano CD", year: 2023, km: 25000, price: 104900, fipe: 106300, color: "Branco", transmission: "Manual", fuel: "Flex", body: "Picape", hours: 90, store: 1, level: 2 },
  { brand: "Toyota", model: "Hilux", version: "2.8 SRX 4x4 Diesel", year: 2020, km: 98000, price: 219900, fipe: 224500, color: "Prata", transmission: "Automático", fuel: "Diesel", body: "Picape", hours: 24 * 20, store: 1, level: 3 },
  { brand: "Chevrolet", model: "Tracker", version: "1.2 Turbo Premier", year: 2022, km: 57000, price: 112900, fipe: 115600, color: "Preto", transmission: "Automático", fuel: "Flex", body: "SUV", hours: 24 * 35, store: 1, level: 3 },
  { brand: "Nissan", model: "Kicks", version: "1.6 Advance CVT", year: 2023, km: 29000, price: 109900, fipe: 112200, color: "Cinza", transmission: "CVT", fuel: "Flex", body: "SUV", hours: 24 * 45, store: 0, level: 2 },
  { brand: "Hyundai", model: "HB20", version: "1.0 Comfort Plus", year: 2021, km: 54000, price: 66900, fipe: 68800, color: "Prata", transmission: "Manual", fuel: "Flex", body: "Hatch", hours: 24 * 75, store: 0, level: 1 },
  { brand: "Honda", model: "Civic", version: "2.0 EXL CVT", year: 2021, km: 59000, price: 124900, fipe: 127700, color: "Preto", transmission: "CVT", fuel: "Flex", body: "Sedã", hours: 24 * 95, store: 1, level: 3 },
  { brand: "Volkswagen", model: "Saveiro", version: "1.6 Robust CD", year: 2022, km: 63000, price: 84900, fipe: 87100, color: "Branco", transmission: "Manual", fuel: "Flex", body: "Picape", hours: 24 * 12, store: 0, level: 1 },
  { brand: "Chevrolet", model: "Spin", version: "1.8 Premier 7L", year: 2022, km: 44000, price: 99900, fipe: 101900, color: "Prata", transmission: "Automático", fuel: "Flex", body: "Minivan", hours: 24 * 18, store: 1, level: 2 },
  { brand: "Fiat", model: "Fiorino", version: "1.4 Endurance", year: 2023, km: 31000, price: 89900, fipe: 91500, color: "Branco", transmission: "Manual", fuel: "Flex", body: "Van/Utilitário", hours: 24 * 26, store: 0, level: 1 },
  { brand: "BMW", model: "Z4", version: "2.0 sDrive30i M Sport", year: 2021, km: 22000, price: 359900, fipe: 368000, color: "Azul", transmission: "Automático", fuel: "Gasolina", body: "Conversível", hours: 24 * 33, store: 0, level: 3, history: true },
  { brand: "Volkswagen", model: "Jetta", version: "2.0 350 TSI GLI", year: 2022, km: 34000, price: 179900, fipe: 183500, color: "Branco", transmission: "Automático", fuel: "Gasolina", body: "Sedã", hours: 24 * 8, store: 1, level: 3 },
  { brand: "Peugeot", model: "208", version: "1.0 Like", year: 2024, km: 18000, price: 76900, fipe: 78900, color: "Vermelho", transmission: "Manual", fuel: "Flex", body: "Hatch", hours: 24 * 4, store: 1, level: 1, status: "sold" },
  { brand: "Honda", model: "CG 160", version: "Titan", year: 2024, km: 6000, price: 18900, fipe: 19500, color: "Vermelho", transmission: "Manual", fuel: "Flex", body: "Street", hours: 26, store: 0, level: 1, type: "moto" },
  { brand: "Yamaha", model: "Fazer FZ25", version: "250 ABS", year: 2023, km: 11000, price: 22900, fipe: 23800, color: "Azul", transmission: "Manual", fuel: "Flex", body: "Street", hours: 60, store: 1, level: 1, type: "moto" },
];

const BUYERS = [
  "Mariana Souza", "Carlos Henrique", "Fernanda Lima", "Rafael Oliveira", "Juliana Costa",
  "Bruno Martins", "Patrícia Alves", "Lucas Pereira", "Camila Rocha", "Diego Fernandes",
  "Aline Ribeiro", "Thiago Gomes", "Renata Dias", "Gustavo Barbosa", "Larissa Melo",
  "Eduardo Nunes", "Beatriz Cardoso", "Felipe Teixeira", "Vanessa Moreira", "André Castro",
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
    .values({
      slug: "demo",
      name: "SoftMotors",
      logoUrl: "/brand/softmotors-logo.png",
      primaryColor: "#4f6be6",
      whatsapp: "5511999990000",
    })
    .returning();

  const [mor, tat] = await db
    .insert(stores)
    .values([
      { tenantId: t.id, name: "Loja Morumbi", city: "São Paulo - SP", address: "Av. Giovanni Gronchi, 5000", whatsapp: "5511999990001" },
      { tenantId: t.id, name: "Loja Tatuapé", city: "São Paulo - SP", address: "Rua Tuiuti, 1200", whatsapp: "5511999990002" },
    ])
    .returning();

  await db.insert(users).values([
    { tenantId: t.id, name: "Ricardo Mendes", email: "gestor@softmotors.demo", role: "manager" },
    { tenantId: t.id, storeId: mor.id, name: "Ana Paula", phone: "5511999991001" },
    { tenantId: t.id, storeId: mor.id, name: "João Victor", phone: "5511999991002" },
    { tenantId: t.id, storeId: tat.id, name: "Paulo Santos", phone: "5511999991003" },
    { tenantId: t.id, storeId: tat.id, name: "Larissa Prado", phone: "5511999991004" },
  ]);

  const created = [];
  for (const c of STOCK) {
    const [v] = await db
      .insert(vehicles)
      .values({
        tenantId: t.id,
        storeId: c.store === 0 ? mor.id : tat.id,
        slug: slugify(`${c.brand} ${c.model} ${c.version} ${c.year}`),
        type: c.type ?? "car",
        brand: c.brand, model: c.model, version: c.version, year: c.year,
        yearModel: c.yearModel ?? c.year, km: c.km, price: c.price, fipePrice: c.fipe,
        color: c.color, transmission: c.transmission, fuel: c.fuel, bodyType: c.body,
        optionals: c.type === "moto" ? ["Freio ABS", "Partida elétrica", "Painel digital"] : pack(c.level),
        acceptsTrade: true,
        factoryWarranty: c.warranty ?? false,
        hasHistoryReport: c.history ?? false,
        featured: c.featured ?? false,
        tag: c.tag ?? null,
        status: c.status ?? "available",
        description: `${c.brand} ${c.model} ${c.version}, revisado, com laudo cautelar aprovado e garantia da loja.`,
        stockedAt: hoursAgo(c.hours),
        soldAt: c.status === "sold" ? hoursAgo(1) : null,
      })
      .returning();
    created.push(v);
    await db.insert(listings).values(
      ALL_MARKETPLACES.map((m) => ({
        tenantId: t.id,
        vehicleId: v.id,
        marketplace: m,
        enabled: !(m === "webmotors" && c.price < 50000),
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
      phone: `55119${String(88000000 + i * 1371).slice(0, 8)}`,
      message: channel === "site" ? "Olá, tenho interesse no veículo. Aceita troca?" : null,
    });
    const status = i < 7 ? "new" : i < 14 ? "in_progress" : i % 2 ? "won" : "lost";
    await db.update(leads).set({ status, createdAt: hoursAgo(i * 30) }).where(eq(leads.id, lead.id));
  }

  console.log(`Seed ok: tenant ${t.slug}, ${created.length} veículos, ${BUYERS.length} leads.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
