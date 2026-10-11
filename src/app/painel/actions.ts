"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  leads,
  leadStatus,
  listings,
  users,
  vehicles,
  vehicleStatus,
  type LeadStatus,
  type Marketplace,
  type VehicleStatus,
} from "@/db/schema";
import { slugify } from "@/lib/format";
import { createLead } from "@/lib/leads";
import { ALL_MARKETPLACES, setListing, syncVehicle } from "@/lib/marketplaces";
import { getTenant } from "@/lib/tenant";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => {
  const n = Number(str(fd, k).replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export async function saveVehicle(fd: FormData) {
  const tenant = await getTenant();
  const id = Number(fd.get("id")) || null;
  const data = {
    storeId: int(fd, "storeId"),
    plate: str(fd, "plate").toUpperCase() || null,
    brand: str(fd, "brand"),
    model: str(fd, "model"),
    version: str(fd, "version") || null,
    year: int(fd, "year"),
    km: int(fd, "km"),
    price: int(fd, "price"),
    fipePrice: int(fd, "fipePrice") || null,
    color: str(fd, "color") || null,
    transmission: str(fd, "transmission") || null,
    fuel: str(fd, "fuel") || null,
    bodyType: str(fd, "bodyType") || null,
    description: str(fd, "description") || null,
  };
  if (!data.brand || !data.model || !data.year || !data.price || !data.storeId) {
    redirect(id ? `/painel/estoque/${id}?erro=1` : "/painel/estoque/novo?erro=1");
  }

  let vehicleId = id;
  if (id) {
    await db.update(vehicles).set(data).where(and(eq(vehicles.id, id), eq(vehicles.tenantId, tenant.id)));
  } else {
    const slug = `${slugify(`${data.brand} ${data.model} ${data.version ?? ""} ${data.year}`)}-${Date.now().toString(36)}`;
    const [v] = await db
      .insert(vehicles)
      .values({ ...data, tenantId: tenant.id, slug })
      .returning({ id: vehicles.id });
    vehicleId = v.id;
    // Carro novo já entra ligado em todos os portais.
    await db
      .insert(listings)
      .values(ALL_MARKETPLACES.map((m) => ({ tenantId: tenant.id, vehicleId: v.id, marketplace: m })));
  }
  await syncVehicle(tenant.id, vehicleId!);
  revalidatePath("/", "layout");
  redirect(`/painel/estoque/${vehicleId}?salvo=1`);
}

export async function setVehicleStatus(fd: FormData) {
  const tenant = await getTenant();
  const id = Number(fd.get("id"));
  const status = str(fd, "status") as VehicleStatus;
  if (!vehicleStatus.enumValues.includes(status)) return;
  await db
    .update(vehicles)
    .set({ status, soldAt: status === "sold" ? new Date() : null })
    .where(and(eq(vehicles.id, id), eq(vehicles.tenantId, tenant.id)));
  await syncVehicle(tenant.id, id);
  revalidatePath("/", "layout");
}

export async function toggleListing(fd: FormData) {
  const tenant = await getTenant();
  const mp = str(fd, "marketplace") as Marketplace;
  if (!ALL_MARKETPLACES.includes(mp)) return;
  await setListing(tenant.id, Number(fd.get("vehicleId")), mp, fd.get("enabled") === "1");
  revalidatePath("/painel", "layout");
}

export async function updateLead(fd: FormData) {
  const tenant = await getTenant();
  const id = Number(fd.get("id"));
  const status = str(fd, "status") as LeadStatus;
  const sellerId = Number(fd.get("sellerId")) || null;
  if (!leadStatus.enumValues.includes(status)) return;
  await db
    .update(leads)
    .set({ status, sellerId })
    .where(and(eq(leads.id, id), eq(leads.tenantId, tenant.id)));
  revalidatePath("/painel", "layout");
}

/** Demonstração: gera um lead como se tivesse chegado de um portal. */
export async function simulatePortalLead() {
  const tenant = await getTenant();
  const [l] = await db
    .select()
    .from(listings)
    .where(and(eq(listings.tenantId, tenant.id), eq(listings.status, "published")))
    .orderBy(sql`random()`)
    .limit(1);
  if (!l) return;
  const names = ["Marcos Vieira", "Sabrina Lopes", "Henrique Faria", "Tatiane Rezende", "Otávio Brito"];
  await createLead({
    tenantId: tenant.id,
    vehicleId: l.vehicleId,
    channel: l.marketplace,
    name: names[Math.floor(Math.random() * names.length)],
    phone: `55449${Math.floor(10000000 + Math.random() * 89999999)}`,
    message: "Ainda está disponível?",
  });
  revalidatePath("/painel", "layout");
}

export async function addSeller(fd: FormData) {
  const tenant = await getTenant();
  const name = str(fd, "name");
  if (!name) return;
  await db.insert(users).values({
    tenantId: tenant.id,
    storeId: int(fd, "storeId") || null,
    name,
    phone: str(fd, "phone").replace(/\D/g, "") || null,
    role: "seller",
  });
  revalidatePath("/painel/vendedores");
}

export async function toggleSeller(fd: FormData) {
  const tenant = await getTenant();
  await db
    .update(users)
    .set({ active: fd.get("active") === "1" })
    .where(and(eq(users.id, Number(fd.get("id"))), eq(users.tenantId, tenant.id)));
  revalidatePath("/painel/vendedores");
}
