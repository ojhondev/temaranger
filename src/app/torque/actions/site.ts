"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { banners, stores, tenants, type TenantSettings } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { onlyDigits } from "@/lib/format";
import { DEFAULT_SECTIONS, type SectionKey } from "@/lib/settings";

const MANAGERS = ["master", "manager"] as const;
const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);
const url = (fd: FormData, k: string) => {
  const v = str(fd, k, 1000);
  return /^(https:\/\/|\/)/.test(v) ? v : null;
};
const phone = (v: string) => {
  const d = onlyDigits(v);
  return d.length === 10 || d.length === 11 ? `55${d}` : d || null;
};

async function patchSettings(tenantId: number, patch: Partial<TenantSettings>) {
  const [t] = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId));
  await db
    .update(tenants)
    .set({ settings: { ...(t?.settings ?? {}), ...patch } })
    .where(eq(tenants.id, tenantId));
}

function done(path: string) {
  revalidatePath("/", "layout");
  redirect(`${path}?salvo=1`);
}

export async function saveIdentity(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const name = str(fd, "name", 80);
  const color = str(fd, "primaryColor", 7);
  await db
    .update(tenants)
    .set({
      ...(name ? { name } : {}),
      logoUrl: url(fd, "logoUrl"),
      ...(/^#[0-9a-f]{6}$/i.test(color) ? { primaryColor: color } : {}),
    })
    .where(eq(tenants.id, s.tenantId));
  await patchSettings(s.tenantId, {
    seoTitle: str(fd, "seoTitle", 70) || undefined,
    seoDescription: str(fd, "seoDescription", 170) || undefined,
    footerText: str(fd, "footerText", 200) || undefined,
  });
  done("/torque/site");
}

export async function saveContact(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  await db.update(tenants).set({ whatsapp: phone(str(fd, "whatsapp")) }).where(eq(tenants.id, s.tenantId));
  await patchSettings(s.tenantId, {
    whatsappMessage: str(fd, "whatsappMessage", 200) || undefined,
    phone: str(fd, "phone", 30) || undefined,
    email: str(fd, "email", 120) || undefined,
    instagram: url(fd, "instagram") ?? undefined,
    facebook: url(fd, "facebook") ?? undefined,
    youtube: url(fd, "youtube") ?? undefined,
  });
  done("/torque/site/contato");
}

export async function saveHome(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const sections = Object.fromEntries((Object.keys(DEFAULT_SECTIONS) as SectionKey[]).map((k) => [k, fd.get(`section_${k}`) === "on"]));
  const rate = Number(str(fd, "financingRate").replace(",", "."));
  await patchSettings(s.tenantId, {
    sections,
    sellBanner: { title: str(fd, "sellTitle", 80) || undefined, subtitle: str(fd, "sellSubtitle", 120) || undefined, cta: str(fd, "sellCta", 30) || undefined },
    financingRate: Number.isFinite(rate) && rate > 0 && rate < 10 ? rate / 100 : undefined,
  });
  done("/torque/site/inicio");
}

export async function saveBanner(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const id = Number(fd.get("id")) || null;
  const placement = str(fd, "placement") === "promo" ? ("promo" as const) : ("hero" as const);
  const title = str(fd, "title", 120);
  if (!title) redirect("/torque/site/banners?erro=1");
  const href = str(fd, "href", 500);
  const data = {
    placement,
    heading: str(fd, "heading", 80) || null,
    title,
    subtitle: str(fd, "subtitle", 160) || null,
    ctaLabel: str(fd, "ctaLabel", 40) || null,
    href: /^(https?:\/\/|\/)/.test(href) ? href : href ? `/${href.replace(/^\/+/, "")}` : null,
    imageUrl: url(fd, "imageUrl"),
    active: fd.get("active") !== "off",
  };
  if (id) {
    await db.update(banners).set(data).where(and(eq(banners.id, id), eq(banners.tenantId, s.tenantId)));
  } else {
    const existing = await db.select({ id: banners.id }).from(banners).where(and(eq(banners.tenantId, s.tenantId), eq(banners.placement, placement)));
    await db.insert(banners).values({ ...data, tenantId: s.tenantId, position: existing.length });
  }
  done("/torque/site/banners");
}

export async function bannerAction(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const id = Number(fd.get("id"));
  const op = str(fd, "op");
  const [b] = await db.select().from(banners).where(and(eq(banners.id, id), eq(banners.tenantId, s.tenantId)));
  if (!b) return;

  if (op === "toggle") await db.update(banners).set({ active: !b.active }).where(eq(banners.id, id));
  if (op === "delete") await db.delete(banners).where(eq(banners.id, id));
  if (op === "up" || op === "down") {
    const list = await db
      .select()
      .from(banners)
      .where(and(eq(banners.tenantId, s.tenantId), eq(banners.placement, b.placement)))
      .orderBy(asc(banners.position), asc(banners.id));
    const i = list.findIndex((x) => x.id === id);
    const j = op === "up" ? i - 1 : i + 1;
    if (j >= 0 && j < list.length) {
      [list[i], list[j]] = [list[j], list[i]];
      for (const [pos, row] of list.entries()) await db.update(banners).set({ position: pos }).where(eq(banners.id, row.id));
    }
  }
  revalidatePath("/", "layout");
}

export async function saveStore(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const id = Number(fd.get("id")) || null;
  const data = {
    name: str(fd, "name", 80),
    city: str(fd, "city", 80),
    address: str(fd, "address", 160) || null,
    whatsapp: phone(str(fd, "whatsapp")),
  };
  if (!data.name || !data.city) redirect("/torque/site/lojas?erro=1");
  if (id) await db.update(stores).set(data).where(and(eq(stores.id, id), eq(stores.tenantId, s.tenantId)));
  else await db.insert(stores).values({ ...data, tenantId: s.tenantId });
  done("/torque/site/lojas");
}
