import { and, eq, lt, ne, sql } from "drizzle-orm";

import { MobileNav, Sidebar } from "@/components/torque/sidebar";
import { Topbar, type Alert } from "@/components/torque/topbar";
import { TourProvider } from "@/components/torque/tour";
import { db } from "@/db";
import { leads, listings, vehicles } from "@/db/schema";
import { isManager, requireSession } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Torque", template: "%s · Torque" }, robots: { index: false } };

const ROLE_LABEL = { master: "Master SoftMotors", manager: "Gestor", seller: "Vendedor" } as const;

export default async function TorqueLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const tenant = await getTenant();
  const manager = isManager(session);

  const sixtyDaysAgo = new Date(Date.now() - 60 * 86_400_000);
  const [[fresh], [errors], [aged]] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(eq(leads.tenantId, tenant.id), eq(leads.status, "new"), manager ? undefined : eq(leads.sellerId, session.user.id))),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(listings)
      .where(and(eq(listings.tenantId, tenant.id), eq(listings.status, "error"))),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(vehicles)
      .where(and(eq(vehicles.tenantId, tenant.id), ne(vehicles.status, "sold"), lt(vehicles.stockedAt, sixtyDaysAgo))),
  ]);

  const alerts: Alert[] = [];
  if (fresh.n) alerts.push({ label: `${fresh.n} ${fresh.n === 1 ? "lead aguardando" : "leads aguardando"} resposta`, href: "/torque/crm/leads?status=new", tone: "blue" });
  if (manager && errors.n) alerts.push({ label: `${errors.n} ${errors.n === 1 ? "anúncio" : "anúncios"} com erro nos portais`, href: "/torque/marketplaces", tone: "red" });
  if (manager && aged.n) alerts.push({ label: `${aged.n} ${aged.n === 1 ? "carro parado" : "carros parados"} há mais de 60 dias`, href: "/torque/estoque", tone: "red" });

  return (
    <div
      className="flex min-h-dvh bg-[#f3f3f6] font-heading text-[#1f1f28]"
      style={{ "--primary": "#e3173e" } as React.CSSProperties}
    >
      <TourProvider initialSeen={session.user.toursSeen} supportWhatsapp={process.env.SOFTMOTORS_WHATSAPP ?? null}>
        <Sidebar isManager={manager} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            userName={session.user.name}
            role={ROLE_LABEL[session.role]}
            tenantName={tenant.name}
            newLeads={fresh.n}
            alerts={alerts}
          />
          <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
          <footer className="flex items-center justify-between border-t border-[#e6e6ec] px-4 py-4 text-xs text-[#6b6b76] md:px-8">
            <span>© {new Date().getFullYear()} SoftMotors. Todos os direitos reservados.</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/softmotors-logo.png" alt="SoftMotors" className="h-4 w-auto opacity-80" />
          </footer>
        </div>
        <MobileNav isManager={manager} />
      </TourProvider>
    </div>
  );
}
