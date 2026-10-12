import { NextResponse } from "next/server";

import { db } from "@/db";
import { demoLeads } from "@/db/schema";
import { onlyDigits } from "@/lib/format";
import { originOf, setDemoLeadCookie } from "@/lib/sandbox";

/**
 * Captação da LP (softmotors.com.br): o formulário com o WhatsApp posta aqui. O número vira
 * lead da SoftMotors e segue num cookie (nunca na URL) para o formulário da demonstração.
 */
export async function POST(req: Request) {
  const fd = await req.formData();
  let phone = onlyDigits(String(fd.get("whatsapp") ?? "")).slice(0, 13);
  if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
  const back = new URL("/comecar", originOf(req));
  if (phone.length >= 12 && !fd.get("website")) {
    const [lead] = await db
      .insert(demoLeads)
      .values({ whatsapp: phone, source: String(fd.get("source") ?? "lp").slice(0, 60) })
      .returning({ id: demoLeads.id });
    await setDemoLeadCookie(lead.id);
  }
  return NextResponse.redirect(back, 303);
}
