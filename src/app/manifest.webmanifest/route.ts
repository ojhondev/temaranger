import { settingsOf } from "@/lib/settings";
import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/** Manifesto por loja: o site vira um "app" com o nome e a cor da concessionária. */
export async function GET() {
  const t = await getTenant();
  const favicon = settingsOf(t).faviconUrl;
  const manifest = {
    name: t.name,
    short_name: t.name.length > 12 ? t.name.split(" ")[0] : t.name,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "pt-BR",
    icons: favicon
      ? [{ src: favicon, sizes: "512x512", type: "image/png", purpose: "any" }]
      : [192, 512].map((s) => ({ src: `/app-icon?size=${s}`, sizes: `${s}x${s}`, type: "image/png", purpose: "any maskable" })),
  };
  return Response.json(manifest, { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } });
}
