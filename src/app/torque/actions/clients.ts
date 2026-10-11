"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { tenants } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { onlyDigits } from "@/lib/format";
import { platformHost } from "@/lib/platform";
import { provisionTenant } from "@/lib/provision";
import { addDomain } from "@/lib/vercel-domains";

export type CreateClientState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "ok"; name: string; host: string; email: string; password: string; domainRegistered: boolean; domainError?: string };

const str = (fd: FormData, k: string, max = 120) => String(fd.get(k) ?? "").trim().slice(0, max);

/** Nova loja (só master). Devolve a senha provisória do gestor para mostrar uma única vez. */
export async function createClient(_: CreateClientState, fd: FormData): Promise<CreateClientState> {
  await requireSession(["master"]);
  const name = str(fd, "name", 80);
  const managerEmail = str(fd, "managerEmail").toLowerCase();
  const managerName = str(fd, "managerName", 80);
  const city = str(fd, "city", 80);
  if (!name || !managerEmail || !managerName || !city) return { status: "error", error: "Preencha nome da loja, cidade, nome e e-mail do gestor." };
  if (!/^\S+@\S+\.\S+$/.test(managerEmail)) return { status: "error", error: "E-mail do gestor inválido." };

  let whatsapp = onlyDigits(str(fd, "whatsapp"));
  if (whatsapp.length === 10 || whatsapp.length === 11) whatsapp = `55${whatsapp}`;

  const r = await provisionTenant({
    name,
    slug: str(fd, "slug", 40),
    city,
    storeName: str(fd, "storeName", 80),
    whatsapp: whatsapp || null,
    primaryColor: str(fd, "primaryColor", 7),
    managerName,
    managerEmail,
  });
  if (!r.ok) return { status: "error", error: r.error };

  revalidatePath("/torque/clientes");
  return {
    status: "ok",
    name: r.tenant.name,
    host: r.host,
    email: managerEmail,
    password: r.password,
    domainRegistered: r.domainRegistered,
    domainError: r.domainError,
  };
}

/** Tenta registrar de novo o subdomínio da plataforma na Vercel. */
export async function retrySubdomain(fd: FormData) {
  await requireSession(["master"]);
  const [t] = await db.select().from(tenants).where(eq(tenants.id, Number(fd.get("id"))));
  if (t) await addDomain(platformHost(t.slug));
  revalidatePath("/torque/clientes");
}

/** Liga/desliga a loja: desligada, o site sai do ar e só o master entra no Torque. */
export async function toggleClient(fd: FormData) {
  await requireSession(["master"]);
  const id = Number(fd.get("id"));
  await db
    .update(tenants)
    .set({ active: fd.get("active") === "1" })
    .where(eq(tenants.id, id));
  revalidatePath("/torque/clientes");
}
