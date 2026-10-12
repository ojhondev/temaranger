import type { Viewport } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/ranger/footer";
import { MobileTabBar } from "@/components/ranger/mobile-tab-bar";
import { SitePopup } from "@/components/ranger/site-popup";
import { TopBar } from "@/components/ranger/top-bar";
import { listStores } from "@/db/queries";
import { settingsOf } from "@/lib/settings";
import { getTenant } from "@/lib/tenant";

export async function generateMetadata() {
  const t = await getTenant();
  const st = settingsOf(t);
  return {
    title: { default: st.seoTitle, template: `%s | ${t.name}` },
    description: st.seoDescription,
    openGraph: { siteName: t.name, images: t.logoUrl ? [t.logoUrl] : undefined },
    // Instalável como app (atalho na tela inicial abre sem barra do navegador).
    manifest: "/manifest.webmanifest",
    icons: { icon: st.faviconUrl || "/app-icon?size=192", apple: st.faviconUrl || "/app-icon?size=192" },
    appleWebApp: { capable: true, title: t.name, statusBarStyle: "default" as const },
  };
}

export async function generateViewport(): Promise<Viewport> {
  return { themeColor: "#ffffff", viewportFit: "cover" };
}

/** Cada página escolhe o próprio header (home/busca ou página do veículo). */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  if (!tenant.active) notFound();
  const stores = await listStores(tenant.id);
  const st = settingsOf(tenant);

  return (
    <div className="ranger-app flex min-h-dvh flex-col" style={{ "--primary": tenant.primaryColor } as React.CSSProperties}>
      <TopBar bar={st.topBar} />
      <div className={st.layout === "boxed" ? "mx-auto w-full max-w-[1360px] flex-1" : "flex-1"}>{children}</div>
      <Footer tenant={tenant} stores={stores} settings={st} />
      <MobileTabBar tenantName={tenant.name} whatsapp={tenant.whatsapp} settings={st} />
      <SitePopup popup={st.popup} whatsapp={tenant.whatsapp} />
    </div>
  );
}
