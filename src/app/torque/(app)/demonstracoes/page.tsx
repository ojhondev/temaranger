import { desc, eq } from "drizzle-orm";
import { MessageCircle } from "lucide-react";

import { PageHeader } from "@/components/torque/ui";
import { db } from "@/db";
import { demoLeads, tenants } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { publishedAt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Demonstrações" };

const STAGE: Record<string, [string, string]> = {
  captured: ["Deixou o WhatsApp", "bg-[#f3f3f6] text-[#4a4a55]"],
  started: ["Preencheu o formulário", "bg-[#fff6e5] text-[#8a5a00]"],
  site: ["Viu o site", "bg-[#eaf1ff] text-[#1f4fbf]"],
  torque: ["Entrou no Torque", "bg-[#e9f8ee] text-[#1c7a3c]"],
};

/** Funil comercial da SoftMotors: quem pediu a demonstração em tempo real. Só master. */
export default async function Demonstracoes() {
  await requireSession(["master"]);
  const rows = await db
    .select({ lead: demoLeads, store: tenants.name })
    .from(demoLeads)
    .leftJoin(tenants, eq(tenants.id, demoLeads.tenantId))
    .orderBy(desc(demoLeads.createdAt))
    .limit(300);
  const count = (s: string) => rows.filter((r) => r.lead.stage === s).length;

  return (
    <div>
      <PageHeader title="Demonstrações" kicker="Quem testou a SoftMotors em demo.softmotors.com.br" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Object.entries(STAGE).map(([k, [label]]) => (
          <div key={k} className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(16,16,24,.06)]">
            <p className="text-2xl font-semibold">{count(k)}</p>
            <p className="text-xs text-[#6b6b76]">{label}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl bg-white shadow-[0_1px_3px_rgba(16,16,24,.06)]">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b text-left text-xs uppercase tracking-wide text-[#6b6b76]">
            <tr>
              <th className="px-4 py-3 font-medium">Contato</th>
              <th className="px-4 py-3 font-medium">Concessionária</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Carros cadastrados</th>
              <th className="px-4 py-3 font-medium">Quando</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ lead: l, store }) => {
              const [label, tone] = STAGE[l.stage] ?? STAGE.captured;
              return (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{l.contactName ?? "—"}</p>
                    <p className="text-xs text-[#6b6b76]">{l.whatsapp}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-2">
                      {l.primaryColor && <span className="size-3 rounded-full" style={{ background: l.primaryColor }} />}
                      {l.dealership ?? "—"}
                    </p>
                    <p className="text-xs text-[#6b6b76]">
                      {l.city ?? ""}
                      {!store && l.stage !== "captured" && l.stage !== "started" ? " · demonstração expirada" : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tone)}>{label}</span>
                  </td>
                  <td className="px-4 py-3">{l.vehiclesAdded}</td>
                  <td className="px-4 py-3 text-[#6b6b76]">{publishedAt(l.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`https://wa.me/${l.whatsapp}?text=${encodeURIComponent(`Olá${l.contactName ? `, ${l.contactName.split(" ")[0]}` : ""}! Aqui é da SoftMotors. Vi que você testou a demonstração${l.dealership ? ` da ${l.dealership}` : ""}. Posso te ajudar?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1faa53] px-3 text-sm font-semibold text-white"
                    >
                      <MessageCircle className="size-4" /> Chamar
                    </a>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#6b6b76]">
                  Ninguém pediu demonstração ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
