"use server";

import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { stores, vehicles } from "@/db/schema";
import { onlyDigits } from "@/lib/format";
import { createLead } from "@/lib/leads";
import { settingsOf } from "@/lib/settings";
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

export type ContactState = { ok?: boolean; error?: string; url?: string };

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Fluxo de contato configurável (página do veículo e pop-up). Cria o lead no rodízio e
 * devolve para onde o navegador deve ir (WhatsApp do vendedor, ligação) ou só `ok`.
 * `kind`: form | whatsapp | call | popup.
 */
export async function contactAction(_: ContactState, fd: FormData): Promise<ContactState> {
  const tenant = await getTenant();
  const flow = settingsOf(tenant).leadFlow;
  const kind = String(fd.get("kind") ?? "form");
  if (fd.get("website")) return { ok: true }; // honeypot

  const vehicleId = Number(fd.get("vehicleId")) || null;
  const row = vehicleId ? await findVehicle(tenant.id, vehicleId) : null;
  if (vehicleId && !row) return { error: "Este veículo não está mais disponível." };

  const name = String(fd.get("name") ?? "").trim().slice(0, 120);
  let phone = onlyDigits(String(fd.get("phone") ?? "")).slice(0, 13);
  if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
  const email = String(fd.get("email") ?? "").trim().slice(0, 160);
  const asked = kind === "form" || kind === "popup" || flow.askData;

  if (asked) {
    if (name.length < 2) return { error: "Informe seu nome." };
    if (phone.length < 12) return { error: "Informe seu WhatsApp com DDD." };
    if (kind === "form" && flow.emailRequired && !EMAIL_RE.test(email)) return { error: "Informe um e-mail válido." };
  }

  const v = row?.vehicle;
  const carName = v ? `${v.brand} ${v.model} ${v.year}${v.version ? ` (${v.version})` : ""}` : "";
  const popupTitle = String(fd.get("popupTitle") ?? "").slice(0, 120);
  const defaultMessage = {
    form: null,
    whatsapp: "Chamou no WhatsApp.",
    call: "Clicou para ligar.",
    popup: `Cadastro pelo pop-up${popupTitle ? `: ${popupTitle}` : ""}.`,
  }[kind];

  const { seller } = await createLead({
    tenantId: tenant.id,
    vehicleId: v?.id ?? null,
    channel: kind === "whatsapp" ? "whatsapp" : "site",
    name: name || (kind === "call" ? "Contato por telefone" : "Contato via WhatsApp"),
    phone: phone || null,
    email: EMAIL_RE.test(email) ? email : null,
    message: String(fd.get("message") ?? "").trim().slice(0, 1000) || defaultMessage,
    marketingOptIn: fd.get("optIn") === "on" || kind === "popup",
  });

  const sellerWhatsapp = seller?.phone ?? row?.store.whatsapp ?? tenant.whatsapp;
  const hello = `Olá${seller ? `, ${seller.name.split(" ")[0]}` : ""}!`;
  const waText = v ? `${hello} Tenho interesse no ${carName}.` : `${hello} ${settingsOf(tenant).whatsappMessage}`;

  if (kind === "whatsapp" || (kind === "form" && flow.afterForm === "whatsapp")) {
    return sellerWhatsapp ? { ok: true, url: `https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(waText)}` } : { ok: true };
  }
  if (kind === "call") {
    const tel = onlyDigits(settingsOf(tenant).phone ?? "") || row?.store.whatsapp || tenant.whatsapp;
    return tel ? { ok: true, url: `tel:+${tel.startsWith("55") ? tel : `55${tel}`}` } : { ok: true };
  }
  return { ok: true };
}
