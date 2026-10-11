import { Footer } from "@/components/ranger/footer";
import { listStores } from "@/db/queries";
import { getTenant } from "@/lib/tenant";

export async function generateMetadata() {
  const t = await getTenant();
  return {
    title: { default: `${t.name} | Carros seminovos`, template: `%s | ${t.name}` },
  };
}

/** Cada página escolhe o próprio header (home/busca ou página do veículo). */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  const stores = await listStores(tenant.id);

  return (
    <div className="flex min-h-dvh flex-col" style={{ "--primary": tenant.primaryColor } as React.CSSProperties}>
      <div className="flex-1">{children}</div>
      <Footer tenant={tenant} stores={stores} />
    </div>
  );
}
