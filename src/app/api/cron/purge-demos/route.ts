import { NextResponse } from "next/server";

import { purgeExpiredSandboxes } from "@/lib/sandbox";

/** Cron diário da Vercel: apaga as lojas de demonstração vencidas. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ purged: await purgeExpiredSandboxes() });
}
