"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

export type LoginState = { error?: string };

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const back = String(formData.get("voltar") ?? "");
  if (!email || !password) return { error: "Informe e-mail e senha." };

  const [user] = await db.select().from(users).where(eq(users.email, email));
  const ok = user?.active && (await verifyPassword(password, user.passwordHash));
  const tenant = await getTenant();
  if (!ok || (user.role !== "master" && user.tenantId !== tenant.id)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "E-mail ou senha incorretos." };
  }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user.id);
  redirect(back.startsWith("/torque") ? back : "/torque");
}

export async function logout() {
  await destroySession();
  redirect("/torque/entrar");
}
