import { saveStore } from "@/app/torque/actions/site";
import { SiteTabs } from "@/components/torque/site-tabs";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { listStores } from "@/db/queries";
import type { Store } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Site · Lojas" };

function StoreForm({ store }: { store?: Store }) {
  return (
    <form action={saveStore} className="grid gap-3 md:grid-cols-[1fr_1fr_1.4fr_1fr_auto] md:items-end">
      {store && <input type="hidden" name="id" value={store.id} />}
      <Field label="Nome *">
        <input name="name" required defaultValue={store?.name} placeholder="Loja Centro" className={field} />
      </Field>
      <Field label="Cidade - UF *">
        <input name="city" required defaultValue={store?.city} placeholder="São Paulo - SP" className={field} />
      </Field>
      <Field label="Endereço">
        <input name="address" defaultValue={store?.address ?? ""} className={field} />
      </Field>
      <Field label="WhatsApp da loja">
        <input name="whatsapp" defaultValue={store?.whatsapp ?? ""} className={field} />
      </Field>
      <SubmitButton>{store ? "Salvar" : "Adicionar"}</SubmitButton>
    </form>
  );
}

export default async function SiteLojas({ searchParams }: { searchParams: Promise<{ salvo?: string; erro?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const stores = await listStores(tenant.id);
  const { salvo, erro } = await searchParams;

  return (
    <div className="max-w-6xl">
      <PageHeader title="Site" kicker="Lojas (unidades)" />
      <SiteTabs active="/torque/site/lojas" />
      <Saved show={!!salvo} />
      {erro && <p className="mb-4 text-sm text-primary">Informe nome e cidade da loja.</p>}
      <div className="flex flex-col gap-5">
        {stores.map((s) => (
          <Panel key={s.id}>
            <StoreForm store={s} />
          </Panel>
        ))}
        <Panel>
          <h2 className="mb-3 text-base font-semibold">Nova loja</h2>
          <StoreForm />
        </Panel>
      </div>
    </div>
  );
}
