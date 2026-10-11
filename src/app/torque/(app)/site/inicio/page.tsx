import { saveHome } from "@/app/torque/actions/site";
import { SiteTabs } from "@/components/torque/site-tabs";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { requireSession } from "@/lib/auth";
import { SECTION_LABELS, settingsOf, type SectionKey } from "@/lib/settings";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Site · Página inicial" };

export default async function SiteInicio({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const st = settingsOf(tenant);
  const { salvo } = await searchParams;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Site" kicker="Página inicial" />
      <SiteTabs active="/torque/site/inicio" />
      <Saved show={!!salvo} />
      <form action={saveHome} className="flex flex-col gap-5">
        <Panel>
          <h2 className="text-base font-semibold">Seções da página inicial</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">Ligue ou desligue cada bloco. O banner do topo sempre aparece.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(SECTION_LABELS) as SectionKey[]).map((k) => (
              <label key={k} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[#e2e2e8] px-4 py-3 text-sm has-[:checked]:border-primary">
                {SECTION_LABELS[k]}
                <input type="checkbox" name={`section_${k}`} defaultChecked={st.sections[k]} className="size-4 accent-[#e3173e]" />
              </label>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-base font-semibold">Faixa “venda seu usado”</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Texto da esquerda">
              <input name="sellTitle" defaultValue={st.sellBanner.title} className={field} />
            </Field>
            <Field label="Texto da direita">
              <input name="sellSubtitle" defaultValue={st.sellBanner.subtitle} className={field} />
            </Field>
            <Field label="Botão">
              <input name="sellCta" defaultValue={st.sellBanner.cta} className={field} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-base font-semibold">Simulação “Ver parcelas”</h2>
          <Field label="Taxa de juros ao mês (%)" hint="Usada na simulação da página do veículo. Ex.: 1,79" className="max-w-xs">
            <input name="financingRate" inputMode="decimal" defaultValue={(st.financingRate * 100).toFixed(2).replace(".", ",")} className={field} />
          </Field>
        </Panel>
        <div>
          <SubmitButton>Salvar página inicial</SubmitButton>
        </div>
      </form>
    </div>
  );
}
