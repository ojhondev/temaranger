/**
 * Cria ou atualiza um usuário do Torque com senha.
 * Uso: TORQUE_EMAIL=… TORQUE_PASSWORD=… TORQUE_NAME=… TORQUE_ROLE=master|manager|seller \
 *      [TORQUE_TENANT=demo] npx tsx scripts/create-user.ts
 * A senha nunca é gravada em arquivo: só o hash scrypt vai para o banco.
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("../src/db/index");
  const { tenants, users } = await import("../src/db/schema");
  const { hashPassword } = await import("../src/lib/password");

  const email = process.env.TORQUE_EMAIL?.trim().toLowerCase();
  const password = process.env.TORQUE_PASSWORD;
  const role = (process.env.TORQUE_ROLE ?? "manager") as "master" | "manager" | "seller";
  const name = process.env.TORQUE_NAME ?? email;
  if (!email || !password || password.length < 8) throw new Error("Informe TORQUE_EMAIL e TORQUE_PASSWORD (mín. 8 caracteres).");

  let tenantId: number | null = null;
  if (role !== "master") {
    const [t] = await db.select().from(tenants).where(eq(tenants.slug, process.env.TORQUE_TENANT ?? "template"));
    if (!t) throw new Error("Tenant não encontrado.");
    tenantId = t.id;
  }

  const passwordHash = await hashPassword(password);
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    await db.update(users).set({ passwordHash, role, name: name!, tenantId, active: true }).where(eq(users.id, existing.id));
    console.log(`Usuário ${email} atualizado (${role}).`);
  } else {
    await db.insert(users).values({ email, passwordHash, role, name: name!, tenantId });
    console.log(`Usuário ${email} criado (${role}).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
