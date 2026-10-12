import { getDomain, vercelConfigured } from "@/lib/vercel-domains";

export const dynamic = "force-dynamic";

/** Diagnóstico: a integração com a Vercel (domínios) está funcionando? Não expõe nenhum segredo. */
export async function GET() {
  if (!vercelConfigured()) return Response.json({ configured: false, ok: false });
  const r = await getDomain("demo.softmotors.com.br");
  return Response.json({ configured: true, ok: r.ok, ...(r.ok ? { verified: r.verified } : { error: r.error }) });
}
