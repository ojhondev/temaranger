import { and, eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { users, type User, type UserRole } from "@/db/schema";

import { PLATFORM_DOMAIN } from "./platform";
import { isDemoHost } from "./sandbox";
import { getTenant, requestHost } from "./tenant";

export const SESSION_COOKIE = "torque_session";
const SESSION_DAYS = 30;

export { hashPassword, verifyPassword } from "./password";

import { sessionKey } from "./session-key";

export { sessionKey };

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(sessionKey());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    ...(await cookieDomain()),
  });
}

/**
 * Nos subdomínios da plataforma o cookie vale para `.softmotors.com.br`: o master entra uma
 * vez e abre o Torque de qualquer loja. Em domínio próprio, o cookie é só daquele domínio.
 */
async function cookieDomain() {
  const host = await requestHost();
  // A demonstração fica com cookie próprio, sem derrubar a sessão do master nas outras lojas.
  return host.endsWith(`.${PLATFORM_DOMAIN}`) && !isDemoHost(host) ? { domain: `.${PLATFORM_DOMAIN}` } : {};
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  const shared = await cookieDomain();
  if (shared.domain) store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0, ...shared });
}

export type Session = { user: User; tenantId: number; role: UserRole };

/**
 * Usuário logado com acesso à loja desta requisição. O master (equipe SoftMotors) entra em
 * qualquer loja; gestor e vendedor só na própria. Usuário desativado perde o acesso na hora.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  // Pode haver dois cookies (o da plataforma e o da demonstração): vale o que tem acesso a esta loja.
  for (const { value: token } of (await cookies()).getAll(SESSION_COOKIE)) {
    try {
      const { payload } = await jwtVerify(token, sessionKey());
      if (typeof payload.uid !== "number") continue;
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, payload.uid), eq(users.active, true)));
      if (!user || !user.passwordHash) continue;
      const tenant = await getTenant();
      if (user.role !== "master" && (user.tenantId !== tenant.id || !tenant.active)) continue;
      return { user, tenantId: tenant.id, role: user.role };
    } catch {}
  }
  return null;
});

/** Exige login (e, opcionalmente, um dos papéis). Sem permissão, volta ao início do Torque. */
export async function requireSession(roles?: UserRole[]) {
  const session = await getSession();
  if (!session) redirect("/torque/entrar");
  if (roles && !roles.includes(session.role)) redirect("/torque?sem-permissao=1");
  return session;
}

export const isManager = (s: Session) => s.role === "master" || s.role === "manager";
export const isMaster = (s: Session) => s.role === "master";
