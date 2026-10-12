import { saveVehiclePage } from "@/app/torque/actions/site";
import { ChoiceCards, Toggle } from "@/components/torque/choice";
import { SingleImageUpload } from "@/components/torque/image-upload";
import { SiteTabs } from "@/components/torque/site-tabs";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { requireSession } from "@/lib/auth";
import { LEAD_ACTION_LABELS, settingsOf } from "@/lib/settings";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Site · Página do veículo" };

const ACTIONS = [
  { value: "form" as const, label: "Formulário de mensagem", hint: "Nome, e-mail, WhatsApp e mensagem. Vira lead no CRM." },
  { value: "whatsapp" as const, label: "WhatsApp", hint: "Abre a conversa com o vendedor da vez no rodízio." },
  { value: "call" as const, label: "Ligar", hint: "Liga para o telefone da loja (Contato e WhatsApp)." },
];

export default async function SiteVeiculo({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const st = settingsOf(tenant);
  const { salvo } = await searchParams;
  const { leadFlow: flow, priceReference: ref } = st;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Site" kicker="Página do veículo" />
      <SiteTabs active="/torque/site/veiculo" />
      <Saved show={!!salvo} />
      <form action={saveVehiclePage} className="flex flex-col gap-5">
        <Panel data-tour="veiculo-contato">
          <h2 className="text-base font-semibold">Como o cliente fala com a loja</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">
            Botões ao lado do preço (computador) e na barra fixa do rodapé (celular). Todo contato vira lead no CRM e vai para o vendedor da vez.
          </p>
          <p className="mb-2 text-[13px] font-medium text-[#3d3d47]">Ação principal</p>
          <ChoiceCards name="primary" value={flow.primary} className="lg:grid-cols-3" options={ACTIONS} />
          <p className="mb-2 mt-5 text-[13px] font-medium text-[#3d3d47]">Segundo botão</p>
          <ChoiceCards
            name="secondary"
            value={flow.secondary}
            className="lg:grid-cols-4"
            options={[...ACTIONS.map(({ value, label }) => ({ value, label })), { value: "none" as const, label: "Nenhum" }]}
          />

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Toggle name="askData" label="Pedir nome e WhatsApp antes do WhatsApp/ligação" hint="Mais leads identificados no CRM; um passo a mais para o cliente." defaultChecked={flow.askData} />
            <Toggle name="emailRequired" label="E-mail obrigatório no formulário" defaultChecked={flow.emailRequired} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Depois de enviar o formulário">
              <select name="afterForm" defaultValue={flow.afterForm} className={field}>
                <option value="message">Mostrar confirmação na tela</option>
                <option value="whatsapp">Abrir o WhatsApp do vendedor</option>
              </select>
            </Field>
            <Field label="Título do formulário">
              <input name="flowTitle" maxLength={80} defaultValue={flow.title} className={field} />
            </Field>
            {ACTIONS.map((a) => (
              <Field key={a.value} label={`Texto do botão: ${a.label}`}>
                <input name={`label_${a.value}`} maxLength={30} defaultValue={flow.labels[a.value]} placeholder={LEAD_ACTION_LABELS[a.value]} className={field} />
              </Field>
            ))}
          </div>
        </Panel>

        <Panel data-tour="veiculo-referencia">
          <h2 className="text-base font-semibold">Referência de preço</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">Card logo abaixo do preço: um selo ou imagem de referência e, se o carro tiver FIPE cadastrada, a comparação automática.</p>
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Toggle name="refEnabled" label="Mostrar referência de preço" defaultChecked={ref.enabled} />
              <Toggle name="refFipe" label="Comparar com a tabela FIPE" hint="Usa o campo FIPE do cadastro do veículo." defaultChecked={ref.showFipe} />
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_280px]">
              <div className="grid gap-4">
                <Field label="Título">
                  <input name="refTitle" maxLength={60} defaultValue={ref.title} className={field} />
                </Field>
                <Field label="Texto (opcional)">
                  <textarea name="refText" maxLength={300} rows={3} defaultValue={ref.text} placeholder="Preço avaliado pela tabela FIPE e por pesquisa de mercado da região." className={`${field} h-auto py-3`} />
                </Field>
                <Field label="Link ao clicar (opcional)">
                  <input name="refHref" defaultValue={ref.href} placeholder="https://veiculos.fipe.org.br" className={field} />
                </Field>
              </div>
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-[#3d3d47]">Imagem (opcional)</p>
                <SingleImageUpload name="refImage" folder={`lojas/${tenant.id}/referencia`} defaultValue={ref.imageUrl} aspect="aspect-[16/9]" contain hint="Selo ou banner de referência." />
              </div>
            </div>
          </div>
        </Panel>
        <div>
          <SubmitButton>Salvar página do veículo</SubmitButton>
        </div>
      </form>
    </div>
  );
}
