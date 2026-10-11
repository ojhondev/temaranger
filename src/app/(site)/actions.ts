"use server";

import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { stores, vehicles } from "@/db/schema";
import { onlyDigits } from "@/lib/format";
import { createLead } from "@/lib/leads";
import { getTenant } from "@/lib/tenant";

async function findVehicle(tenantId: number, id: number) {
  const [row] = await db
    .select({ vehicle: vehicles, store: stores })
    .from(vehicles)
    .innerJoin(stores, eq(stores.id, vehicles.storeId))
    .where(and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, id), ne(vehicles.status, "sold")));
  return row;
}

/** Formulário "tenho interesse" da página do veículo. */
export async function submitInterest(formData: FormData) {
  const tenant = await getTenant();
  const row = await findVehicle(tenant.id, Number(formData.get("vehicleId")));
  if (!row) redirect("/estoque");

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  let phone = onlyDigits(String(formData.get("phone"))).slice(0, 13);
  if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
  // Honeypot: robôs preenchem o campo escondido.
  if (formData.get("website") || !name || phone.length < 10) {
    redirect(`/veiculo/${row.vehicle.slug}?erro=1`);
  }

  const email = String(formData.get("email") ?? "").trim().slice(0, 160);
  await createLead({
    tenantId: tenant.id,
    vehicleId: row.vehicle.id,
    channel: "site",
    name,
    phone,
    email: /^\S+@\S+\.\S+$/.test(email) ? email : null,
    message: String(formData.get("message") ?? "").slice(0, 1000) || null,
    marketingOptIn: formData.get("optIn") === "on",
  });
  redirect(`/veiculo/${row.vehicle.slug}?enviado=1`);
}

const INTENTS: Record<string, string> = {
  video: "Gostaria de agendar uma videochamada para ver o",
  report: "Quero reportar um problema no anúncio do",
};

/**
 * Botão de WhatsApp: registra o lead, escolhe o vendedor do rodízio e abre a conversa.
 * `intent` muda a mensagem (ex.: agendar videochamada).
 */
export async function startWhatsapp(formData: FormData) {
  const tenant = await getTenant();
  const row = await findVehicle(tenant.id, Number(formData.get("vehicleId")));
  if (!row) redirect("/estoque");
  const v = row.vehicle;

  const { seller } = await createLead({
    tenantId: tenant.id,
    vehicleId: v.id,
    channel: "whatsapp",
    name: "Contato via WhatsApp",
    message: formData.get("intent") === "video" ? "Quer agendar uma videochamada." : null,
  });
  const number = seller?.phone ?? row.store.whatsapp ?? tenant.whatsapp;
  const intro = INTENTS[String(formData.get("intent"))] ?? "Tenho interesse no";
  const text = `Olá${seller ? `, ${seller.name.split(" ")[0]}` : ""}! ${intro} ${v.brand} ${v.model} ${v.year} (${v.version}).`;
  redirect(`https://wa.me/${number}?text=${encodeURIComponent(text)}`);
}
