import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { TOURS } from "@/lib/tour";

/** Marca um tour guiado como visto (concluído ou pulado), para não abrir sozinho de novo. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!TOURS.some((t) => t.id === id)) return NextResponse.json({ ok: false }, { status: 400 });

  await db
    .update(users)
    .set({
      toursSeen: sql`case when ${users.toursSeen} @> ${JSON.stringify([id])}::jsonb then ${users.toursSeen} else ${users.toursSeen} || ${JSON.stringify([id])}::jsonb end`,
    })
    .where(eq(users.id, session.user.id));
  return NextResponse.json({ ok: true });
}
