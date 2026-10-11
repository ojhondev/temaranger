import { saveContact } from "@/app/torque/actions/site";
import { SiteTabs } from "@/components/torque/site-tabs";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { requireSession } from "@/lib/auth";
import { settingsOf } from "@/lib/settings";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Site · Contato e WhatsApp" };

export default async function SiteContato({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const st = settingsOf(tenant);
  const { salvo } = await searchParams;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Site" kicker="Contato e WhatsApp" />
      <SiteTabs active="/torque/site/contato" />
      <Saved show={!!salvo} />
      <form action={saveContact} className="flex flex-col gap-5">
        <Panel>
          <h2 className="text-base font-semibold">WhatsApp</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">
            Usado no botão “Chat” do topo, nos banners e em “Quero vender”. Nos carros, o WhatsApp abre direto com o vendedor do rodízio.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Número principal (com DDD)">
              <input name="whatsapp" inputMode="tel" defaultValue={tenant.whatsapp ?? ""} placeholder="(11) 99999-0000" className={field} />
            </Field>
            <Field label="Mensagem inicial">
              <input name="whatsappMessage" defaultValue={st.whatsappMessage} className={field} />
            </Field>
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-4 text-base font-semibold">Outros contatos e redes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Telefone fixo">
              <input name="phone" defaultValue={st.phone ?? ""} className={field} />
            </Field>
            <Field label="E-mail">
              <input name="email" type="email" defaultValue={st.email ?? ""} className={field} />
            </Field>
            <Field label="Instagram (link)">
              <input name="instagram" defaultValue={st.instagram ?? ""} placeholder="https://instagram.com/sualoja" className={field} />
            </Field>
            <Field label="Facebook (link)">
              <input name="facebook" defaultValue={st.facebook ?? ""} placeholder="https://facebook.com/sualoja" className={field} />
            </Field>
            <Field label="YouTube (link)">
              <input name="youtube" defaultValue={st.youtube ?? ""} className={field} />
            </Field>
          </div>
        </Panel>
        <div>
          <SubmitButton>Salvar contatos</SubmitButton>
        </div>
      </form>
    </div>
  );
}
