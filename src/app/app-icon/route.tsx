import { ImageResponse } from "next/og";

import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/** Ícone do app da loja: iniciais em branco sobre a cor da loja. */
export async function GET(req: Request) {
  const t = await getTenant();
  const size = new URL(req.url).searchParams.get("size") === "512" ? 512 : 192;
  const initials = t.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: t.primaryColor, color: "#fff", fontSize: size * 0.4, fontWeight: 800 }}>
        {initials}
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
