"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { stores, users } from "@/db/schema";
import { hashPassword, requireSession, verifyPassword } from "@/lib/auth";
import { onlyDigits } from "@/lib/format";

const MANAGERS = ["master", "manager"] as const;
const str = (fd: FormData, k: string, max = 160) => String(fd.get(k) ?? "").trim().slice(0, max);

async function validStore(tenantId: number, storeId: number) {
  if (!storeId) return null;
  const [s] = await db.select({ id: stores.id }).from(stores).where(and(eq(stores.id, storeId), eq(stores.tenantId, tenantId)));
  return s?.id ?? null;
}

/** Adiciona ou edita alguém da equipe. Senha opcional: sem ela, a pessoa só recebe leads. */
export async function saveMember(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const id = Number(fd.get("id")) || null;
  const role = str(fd, "role") === "manager" ? ("manager" as const) : ("seller" as const);
  const email = str(fd, "email").toLowerCase() || null;
  const password = String(fd.get("password") ?? "");
  const name = str(fd, "name", 80);
  let phone = onlyDigits(str(fd, "phone"));
  if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;

  const back = (msg: string) => redirect(`/torque/equipe?erro=${encodeURIComponent(msg)}`);
  if (!name) back("Informe o nome.");
  if (password && password.length < 8) back("A senha precisa de pelo menos 8 caracteres.");
  if (password && !email) back("Para dar acesso ao Torque, informe o e-mail.");
  if (email) {
    const [dup] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), id ? ne(users.id, id) : undefined));
    if (dup) back("Já existe alguém com esse e-mail.");
  }

  const data = {
    name,
    email,
    phone: phone || null,
    role,
    storeId: await validStore(s.tenantId, Number(fd.get("storeId"))),
    ...(password ? { passwordHash: await hashPassword(password) } : {}),
  };

  if (id) {
    // Nunca altera o master nem a si mesmo para um papel menor por engano.
    const [target] = await db.select().from(users).where(and(eq(users.id, id), eq(users.tenantId, s.tenantId)));
    if (!target || target.role === "master") back("Usuário não encontrado.");
    await db
      .update(users)
      .set(target!.id === s.user.id ? { ...data, role: target!.role } : data)
      .where(eq(users.id, id));
  } else {
    await db.insert(users).values({ ...data, tenantId: s.tenantId });
  }
  revalidatePath("/torque", "layout");
  redirect("/torque/equipe?salvo=1");
}

/** Liga/desliga: fora do ar, não recebe leads e perde o acesso na hora. */
export async function toggleMember(fd: FormData) {
  const s = await requireSession([...MANAGERS]);
  const id = Number(fd.get("id"));
  if (id === s.user.id) return;
  await db
    .update(users)
    .set({ active: fd.get("active") === "1" })
    .where(and(eq(users.id, id), eq(users.tenantId, s.tenantId), ne(users.role, "master")));
  revalidatePath("/torque", "layout");
}

export async function updateProfile(fd: FormData) {
  const s = await requireSession();
  const name = str(fd, "name", 80);
  let phone = onlyDigits(str(fd, "phone"));
  if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
  if (name) await db.update(users).set({ name, phone: phone || null }).where(eq(users.id, s.user.id));
  revalidatePath("/torque", "layout");
  redirect("/torque/conta?salvo=1");
}

export async function changePassword(fd: FormData) {
  const s = await requireSession();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  if (!(await verifyPassword(current, s.user.passwordHash))) redirect("/torque/conta?erro=senha-atual");
  if (next.length < 8 || next !== String(fd.get("confirm") ?? "")) redirect("/torque/conta?erro=senha-nova");
  await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, s.user.id));
  redirect("/torque/conta?salvo=senha");
}
