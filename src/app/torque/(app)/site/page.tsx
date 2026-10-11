import { saveIdentity } from "@/app/torque/actions/site";
import { ColorField } from "@/components/torque/color-field";
import { SingleImageUpload } from "@/components/torque/image-upload";
import { SiteTabs } from "@/components/torque/site-tabs";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { requireSession } from "@/lib/auth";
import { settingsOf } from "@/lib/settings";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Site · Identidade" };

export default async function SiteIdentidade({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const st = settingsOf(tenant);
  const { salvo } = await searchParams;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Site" kicker="Tudo que você salvar aqui aparece no site na hora" />
      <SiteTabs active="/torque/site" />
      <Saved show={!!salvo} />
      <form action={saveIdentity} className="flex flex-col gap-5">
        <Panel data-tour="site-logo">
          <h2 className="mb-4 text-base font-semibold">Marca</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome da loja">
              <input name="name" defaultValue={tenant.name} className={field} />
            </Field>
            <Field label="Cor principal" hint="Botões, preços e destaques do site.">
              <ColorField name="primaryColor" defaultValue={tenant.primaryColor} />
            </Field>
            <div className="md:col-span-2">
              <p className="mb-1.5 text-[13px] font-medium text-[#3d3d47]">Logo</p>
              <div className="max-w-md">
                <SingleImageUpload
                  name="logoUrl"
                  folder={`lojas/${tenant.id}/marca`}
                  defaultValue={tenant.logoUrl}
                  aspect="aspect-[4/1]"
                  contain
                  hint="PNG ou SVG com fundo transparente, na horizontal."
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-1 text-base font-semibold">Google e redes sociais</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">Como o site aparece nas buscas e ao ser compartilhado.</p>
          <div className="grid gap-4">
            <Field label="Título do site" hint="Até 70 caracteres.">
              <input name="seoTitle" maxLength={70} defaultValue={st.seoTitle} className={field} />
            </Field>
            <Field label="Descrição" hint="Até 170 caracteres.">
              <textarea name="seoDescription" maxLength={170} rows={2} defaultValue={st.seoDescription} className={`${field} h-auto py-3`} />
            </Field>
            <Field label="Frase do rodapé">
              <input name="footerText" maxLength={200} defaultValue={st.footerText} className={field} />
            </Field>
          </div>
        </Panel>
        <div>
          <SubmitButton>Salvar identidade</SubmitButton>
        </div>
      </form>
    </div>
  );
}
