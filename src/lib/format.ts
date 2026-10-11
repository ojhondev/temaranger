import type { LeadChannel, LeadStatus, Marketplace, VehicleStatus } from "@/db/schema";

const brlFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const brl = (v: number) => brlFmt.format(v);
export const km = (v: number) => `${v.toLocaleString("pt-BR")} km`;

export function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / 86_400_000);
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function onlyDigits(s: string | null | undefined) {
  return (s ?? "").replace(/\D/g, "");
}

export const MARKETPLACES: Record<Marketplace, string> = {
  olx: "OLX",
  webmotors: "WebMotors",
  mercadolivre: "Mercado Livre",
};

export const CHANNELS: Record<LeadChannel, string> = {
  site: "Site",
  whatsapp: "WhatsApp",
  olx: "OLX",
  webmotors: "WebMotors",
  mercadolivre: "Mercado Livre",
  manual: "Manual",
};

export const LEAD_STATUS: Record<LeadStatus, string> = {
  new: "Novo",
  in_progress: "Em atendimento",
  won: "Ganho",
  lost: "Perdido",
};

export const VEHICLE_STATUS: Record<VehicleStatus, string> = {
  available: "Disponível",
  reserved: "Reservado",
  sold: "Vendido",
};

const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
const dayFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });
const dayKey = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

/** "Hoje, 16:56" · "Ontem, 09:10" · "12 de out." */
export function publishedAt(date: Date) {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (dayKey(date) === dayKey(today)) return `Hoje, ${timeFmt.format(date)}`;
  if (dayKey(date) === dayKey(yesterday)) return `Ontem, ${timeFmt.format(date)}`;
  return dayFmt.format(date);
}
