import { createManualLead } from "@/app/torque/actions/crm";
import { Field, PageHeader, Panel, SubmitButton, field } from "@/components/torque/ui";
import { listAdminVehicles } from "@/db/queries";
import { leadChannel } from "@/db/schema";
import { CHANNELS } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Criar lead" };

export default async function NovoLead({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  await requireSession();
  const tenant = await getTenant();
  const vehicles = (await listAdminVehicles(tenant.id)).filter((r) => r.vehicle.status !== "sold");
  const { erro } = await searchParams;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Criar lead" kicker="CRM" />
      <Panel>
        <p className="mb-5 text-sm text-[#6b6b76]">
          Para contatos que chegaram por telefone, na loja ou por outro canal. O lead entra na fila e aparece nos relatórios.
        </p>
        {erro && <p className="mb-4 text-sm text-primary">Informe pelo menos o nome do cliente.</p>}
        <form action={createManualLead} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome do cliente *">
            <input name="name" required className={field} />
          </Field>
          <Field label="WhatsApp / telefone">
            <input name="phone" inputMode="tel" placeholder="(11) 99999-9999" className={field} />
          </Field>
          <Field label="E-mail">
            <input name="email" type="email" className={field} />
          </Field>
          <Field label="Como chegou">
            <select name="channel" defaultValue="manual" className={field}>
              {leadChannel.enumValues.map((c) => (
                <option key={c} value={c}>
                  {c === "manual" ? "Telefone / loja" : CHANNELS[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Veículo de interesse" className="sm:col-span-2">
            <select name="vehicleId" defaultValue="" className={field}>
              <option value="">Nenhum específico</option>
              {vehicles.map(({ vehicle: v }) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} {v.year} · {v.version}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Observação" className="sm:col-span-2">
            <textarea name="message" rows={3} className={`${field} h-auto py-3`} />
          </Field>
          <div className="sm:col-span-2">
            <SubmitButton>Criar lead</SubmitButton>
          </div>
        </form>
      </Panel>
    </div>
  );
}
