import { and, asc, eq } from "drizzle-orm";

import { FINANCING, HERO_BANNERS, fill } from "@/config/ranger";
import { db } from "@/db";
import { banners, type LeadAction, type PopupAction, type Tenant, type TenantSettings } from "@/db/schema";

export const DEFAULT_SECTIONS = {
  models: true,
  financing: true,
  promos: true,
  sell: true,
  zeroKm: true,
  bodyTypes: true,
} as const;

export type SectionKey = keyof typeof DEFAULT_SECTIONS;

export const SECTION_LABELS: Record<SectionKey, string> = {
  models: "Modelos mais buscados",
  financing: "Carros para financiar com taxas especiais",
  promos: "Banners promocionais (FIPE e financiamento)",
  sell: "Faixa vermelha “venda seu usado”",
  zeroKm: "0 km a pronta entrega",
  bodyTypes: "Tipos de carroceria",
};

/** Configurações da loja com os padrões do tema preenchidos. */
export function settingsOf(tenant: Tenant) {
  const s: TenantSettings = tenant.settings ?? {};
  return {
    ...s,
    whatsappMessage: s.whatsappMessage || "Olá! Vim pelo site e gostaria de mais informações.",
    seoTitle: s.seoTitle || `${tenant.name} | Carros seminovos`,
    seoDescription:
      s.seoDescription || `Carros seminovos revisados e com garantia na ${tenant.name}. Financiamento facilitado e troca com avaliação na hora.`,
    footerText: s.footerText || "Seminovos multimarcas revisados, com procedência e garantia.",
    financingRate: s.financingRate ?? FINANCING.monthlyRate,
    sellBanner: {
      title: s.sellBanner?.title || "Milhões de pessoas de olho no seu usado!",
      subtitle: s.sellBanner?.subtitle || `Venda na ${tenant.name} e dê a partida no novo.`,
      cta: s.sellBanner?.cta || "Vender veículo",
    },
    sections: { ...DEFAULT_SECTIONS, ...(s.sections ?? {}) },
    layout: s.layout ?? "full",
    topBar: {
      enabled: s.topBar?.enabled ?? false,
      text: s.topBar?.text ?? "",
      linkLabel: s.topBar?.linkLabel ?? "",
      href: s.topBar?.href ?? "",
      bg: s.topBar?.bg || "#1f1f28",
      fg: s.topBar?.fg || "#ffffff",
      dismissible: s.topBar?.dismissible ?? true,
    },
    popup: {
      enabled: s.popup?.enabled ?? false,
      title: s.popup?.title ?? "",
      text: s.popup?.text ?? "",
      imageUrl: s.popup?.imageUrl ?? "",
      action: s.popup?.action ?? ("lead" as PopupAction),
      ctaLabel: s.popup?.ctaLabel || "Quero receber",
      href: s.popup?.href ?? "",
      delaySeconds: s.popup?.delaySeconds ?? 5,
      frequency: s.popup?.frequency ?? "day",
      pages: s.popup?.pages ?? "all",
    },
    leadFlow: {
      primary: s.leadFlow?.primary ?? ("form" as LeadAction),
      secondary: s.leadFlow?.secondary ?? ("whatsapp" as LeadAction | "none"),
      askData: s.leadFlow?.askData ?? false,
      afterForm: s.leadFlow?.afterForm ?? "message",
      emailRequired: s.leadFlow?.emailRequired ?? true,
      title: s.leadFlow?.title || "Envie uma mensagem ao vendedor",
      labels: { ...LEAD_ACTION_LABELS, ...(s.leadFlow?.labels ?? {}) },
    },
    priceReference: {
      enabled: s.priceReference?.enabled ?? true,
      title: s.priceReference?.title || "Referência de preço",
      text: s.priceReference?.text ?? "",
      imageUrl: s.priceReference?.imageUrl ?? "",
      href: s.priceReference?.href ?? "",
      showFipe: s.priceReference?.showFipe ?? true,
    },
  };
}

export const LEAD_ACTION_LABELS: Record<LeadAction, string> = {
  form: "Enviar mensagem",
  whatsapp: "Falar no WhatsApp",
  call: "Ligar para a loja",
};

export type ResolvedSettings = ReturnType<typeof settingsOf>;

/** Link de WhatsApp da loja com a mensagem padrão (ou outra). */
export function whatsappLink(number: string | null | undefined, text: string) {
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}

/** Banners ativos do site; sem nenhum cadastrado, usa os do tema. */
export async function activeBanners(tenant: Tenant, placement: "hero" | "promo") {
  const rows = await db
    .select()
    .from(banners)
    .where(and(eq(banners.tenantId, tenant.id), eq(banners.placement, placement), eq(banners.active, true)))
    .orderBy(asc(banners.position), asc(banners.id));
  if (rows.length || placement === "promo") return rows;
  return HERO_BANNERS.map((b, i) => ({
    id: -1 - i,
    tenantId: tenant.id,
    placement: "hero" as const,
    heading: null,
    title: fill(b.title, tenant.name),
    subtitle: fill(b.subtitle, tenant.name),
    ctaLabel: b.cta,
    href: b.href,
    imageUrl: null,
    active: true,
    position: i,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}
