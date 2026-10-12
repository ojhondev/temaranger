"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { listings, stores, vehicles, vehicleStatus, type Marketplace, type VehicleStatus } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { ALL_MARKETPLACES, applyAccountRules, setListing, syncVehicle } from "@/lib/marketplaces";
import { countDemoVehicle, demoVehiclesLeft } from "@/lib/sandbox";

const MANAGERS = ["master", "manager"] as const;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const int = (fd: FormData, k: string) => {
  const n = Number(str(fd, k).replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const jsonList = (fd: FormData, k: string) => {
  try {
    const v = JSON.parse(str(fd, k) || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length < 600).slice(0, 40) : [];
  } catch {
    return [];
  }
};

export async function saveVehicle(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const id = Number(fd.get("id")) || null;

  const storeId = int(fd, "storeId");
  const [store] = await db.select().from(stores).where(and(eq(stores.id, storeId), eq(stores.tenantId, s.tenantId)));

  const optionals = [
    ...fd.getAll("optionals").map(String),
    ...str(fd, "extraOptionals")
      .split(/[,\n]/)
      .map((o) => o.trim())
      .filter(Boolean),
  ];

  const data = {
    storeId,
    type: str(fd, "type") === "moto" ? ("moto" as const) : ("car" as const),
    plate: str(fd, "plate").toUpperCase() || null,
    brand: str(fd, "brand"),
    model: str(fd, "model"),
    version: str(fd, "version") || null,
    year: int(fd, "year"),
    yearModel: int(fd, "yearModel") || null,
    km: int(fd, "km"),
    price: int(fd, "price"),
    fipePrice: int(fd, "fipePrice") || null,
    color: str(fd, "color") || null,
    transmission: str(fd, "transmission") || null,
    fuel: str(fd, "fuel") || null,
    bodyType: str(fd, "bodyType") || null,
    description: str(fd, "description") || null,
    photos: jsonList(fd, "photos"),
    optionals: [...new Set(optionals)].slice(0, 80),
    featured: fd.get("featured") === "on",
    acceptsTrade: fd.get("acceptsTrade") === "on",
    factoryWarranty: fd.get("factoryWarranty") === "on",
    hasHistoryReport: fd.get("hasHistoryReport") === "on",
    tag: str(fd, "tag") || null,
  };
  if (!store || !data.brand || !data.model || !data.year || !data.price) {
    redirect(id ? `/torque/estoque/${id}?erro=1` : "/torque/estoque/novo?erro=1");
  }

  let vehicleId = id;
  if (!id && (await demoVehiclesLeft(s.tenantId)) === 0) redirect("/torque/estoque/novo?limite=1");
  if (id) {
    await db.update(vehicles).set(data).where(and(eq(vehicles.id, id), eq(vehicles.tenantId, s.tenantId)));
  } else {
    const slug = `${slugify(`${data.brand} ${data.model} ${data.version ?? ""} ${data.year}`)}-${Date.now().toString(36)}`;
    const [v] = await db
      .insert(vehicles)
      .values({ ...data, tenantId: s.tenantId, slug })
      .returning({ id: vehicles.id });
    vehicleId = v.id;
    await countDemoVehicle(s.tenantId);
    await db.insert(listings).values(ALL_MARKETPLACES.map((m) => ({ tenantId: s.tenantId, vehicleId: v.id, marketplace: m, enabled: false })));
    // Portais conectados com "todo o estoque" já recebem o carro novo.
    await applyAccountRules(s.tenantId, [v.id]);
  }
  await syncVehicle(s.tenantId, vehicleId!);
  revalidatePath("/", "layout");
  redirect(`/torque/estoque/${vehicleId}?salvo=1`);
}

export async function setVehicleStatus(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const id = Number(fd.get("id"));
  const status = str(fd, "status") as VehicleStatus;
  if (!vehicleStatus.enumValues.includes(status)) return;
  await db
    .update(vehicles)
    .set({ status, soldAt: status === "sold" ? new Date() : null })
    .where(and(eq(vehicles.id, id), eq(vehicles.tenantId, s.tenantId)));
  await syncVehicle(s.tenantId, id);
  revalidatePath("/", "layout");
}

export async function toggleListing(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const mp = str(fd, "marketplace") as Marketplace;
  if (!ALL_MARKETPLACES.includes(mp)) return;
  const vehicleId = Number(fd.get("vehicleId"));
  const [v] = await db.select({ id: vehicles.id }).from(vehicles).where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, s.tenantId)));
  if (!v) return;
  await setListing(s.tenantId, vehicleId, mp, fd.get("enabled") === "1");
  revalidatePath("/torque", "layout");
}

/** Exclui o veículo: antes tira de todos os portais. */
export async function deleteVehicle(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const id = Number(fd.get("id"));
  await db.update(listings).set({ enabled: false }).where(and(eq(listings.vehicleId, id), eq(listings.tenantId, s.tenantId)));
  await syncVehicle(s.tenantId, id);
  await db.delete(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.tenantId, s.tenantId)));
  revalidatePath("/", "layout");
  redirect("/torque/estoque?excluido=1");
}
