/** Chave dos JWT da plataforma (sessão do Torque e cookies da demonstração). */
export function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET ausente ou curta (mín. 32 caracteres).");
  return new TextEncoder().encode(secret);
}
