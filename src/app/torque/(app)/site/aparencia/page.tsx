import { saveAppearance } from "@/app/torque/actions/site";
import { ChoiceCards, Toggle } from "@/components/torque/choice";
import { ColorField } from "@/components/torque/color-field";
import { SingleImageUpload } from "@/components/torque/image-upload";
import { SiteTabs } from "@/components/torque/site-tabs";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { requireSession } from "@/lib/auth";
import { settingsOf } from "@/lib/settings";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Site · Aparência" };

/** Miniatura da largura do site para o cartão de escolha. */
function LayoutArt({ boxed }: { boxed?: boolean }) {
  return (
    <span className="flex h-20 flex-col gap-1.5 rounded-lg bg-[#f3f3f6] p-2">
      <span className={`h-3 rounded bg-[#2a2a33] ${boxed ? "mx-6" : ""}`} />
      <span className={`flex flex-1 gap-1.5 ${boxed ? "mx-6" : ""}`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex-1 rounded bg-[#d9d9e0]" />
        ))}
      </span>
    </span>
  );
}

export default async function SiteAparencia({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const st = settingsOf(tenant);
  const { salvo } = await searchParams;
  const { topBar: bar, popup } = st;

  return (
    <div className="max-w-5xl">
      <PageHeader title="Site" kicker="Aparência, barra superior e pop-up" />
      <SiteTabs active="/torque/site/aparencia" />
      <Saved show={!!salvo} />
      <form action={saveAppearance} className="flex flex-col gap-5">
        <Panel data-tour="aparencia-largura">
          <h2 className="text-base font-semibold">Largura do site</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">Vale para computador. No celular o site sempre ocupa a tela toda.</p>
          <ChoiceCards
            name="layout"
            value={st.layout}
            options={[
              { value: "full", label: "Tela inteira (full width)", hint: "O conteúdo usa toda a largura da tela. Padrão do tema Ranger.", art: <LayoutArt /> },
              { value: "boxed", label: "Centralizado (boxed)", hint: "O conteúdo fica numa coluna central, com margens nas laterais.", art: <LayoutArt boxed /> },
            ]}
          />
        </Panel>

        <Panel data-tour="aparencia-barra">
          <h2 className="text-base font-semibold">Barra superior</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">Faixa fina acima do topo do site: horário, campanha, frete de documentação grátis…</p>
          <div className="grid gap-4">
            <Toggle name="topBarEnabled" label="Mostrar barra superior" defaultChecked={bar.enabled} />
            <Field label="Texto">
              <input name="topBarText" maxLength={160} defaultValue={bar.text} placeholder="Feirão de outubro: taxa a partir de 0,99% a.m." className={field} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Texto do link (opcional)">
                <input name="topBarLinkLabel" maxLength={40} defaultValue={bar.linkLabel} placeholder="Ver ofertas" className={field} />
              </Field>
              <Field label="Link (opcional)" hint="Uma página do site (ex.: /estoque) ou um endereço completo.">
                <input name="topBarHref" defaultValue={bar.href} placeholder="/estoque" className={field} />
              </Field>
              <Field label="Cor de fundo">
                <ColorField name="topBarBg" defaultValue={bar.bg} />
              </Field>
              <Field label="Cor do texto">
                <ColorField name="topBarFg" defaultValue={bar.fg} />
              </Field>
            </div>
            <Toggle name="topBarDismissible" label="Visitante pode fechar a barra" hint="Fechada, ela some até a próxima visita." defaultChecked={bar.dismissible} />
          </div>
        </Panel>

        <Panel data-tour="aparencia-popup">
          <h2 className="text-base font-semibold">Pop-up ao abrir o site</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">Janela que aparece alguns segundos depois que o visitante entra. Use para captar contatos ou divulgar uma campanha.</p>
          <div className="grid gap-4">
            <Toggle name="popupEnabled" label="Ativar pop-up" defaultChecked={popup.enabled} />
            <div className="grid gap-4 md:grid-cols-[1fr_280px]">
              <div className="grid gap-4">
                <Field label="Título">
                  <input name="popupTitle" maxLength={80} defaultValue={popup.title} placeholder="Receba as ofertas da semana" className={field} />
                </Field>
                <Field label="Texto">
                  <textarea name="popupText" maxLength={400} rows={3} defaultValue={popup.text} placeholder="Deixe seu WhatsApp e seja o primeiro a saber dos carros que chegam." className={`${field} h-auto py-3`} />
                </Field>
              </div>
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-[#3d3d47]">Imagem (opcional)</p>
                <SingleImageUpload name="popupImage" folder={`lojas/${tenant.id}/popup`} defaultValue={popup.imageUrl} aspect="aspect-[4/3]" hint="Horizontal, 1200×900 px." />
              </div>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-medium text-[#3d3d47]">O que o botão faz</p>
              <ChoiceCards
                name="popupAction"
                value={popup.action}
                className="lg:grid-cols-4"
                options={[
                  { value: "lead", label: "Captar contato", hint: "Pede nome e WhatsApp. Vira lead no CRM, no rodízio." },
                  { value: "whatsapp", label: "Abrir WhatsApp", hint: "Conversa direto com o WhatsApp da loja." },
                  { value: "link", label: "Abrir um link", hint: "Leva para uma página: estoque, oferta, formulário…" },
                  { value: "none", label: "Só aviso", hint: "Sem botão. O visitante lê e fecha." },
                ]}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Texto do botão">
                <input name="popupCta" maxLength={40} defaultValue={popup.ctaLabel} className={field} />
              </Field>
              <Field label="Link (só para “Abrir um link”)">
                <input name="popupHref" defaultValue={popup.href} placeholder="/estoque?ordem=menor-preco" className={field} />
              </Field>
              <Field label="Abrir depois de (segundos)" hint="0 abre na hora. Recomendado: 5 a 10.">
                <input name="popupDelay" type="number" min={0} max={120} defaultValue={popup.delaySeconds} className={field} />
              </Field>
              <Field label="Mostrar de novo para o mesmo visitante">
                <select name="popupFrequency" defaultValue={popup.frequency} className={field}>
                  <option value="session">Uma vez por visita</option>
                  <option value="day">Uma vez por dia</option>
                  <option value="week">Uma vez por semana</option>
                  <option value="always">Toda vez que abrir uma página</option>
                </select>
              </Field>
              <Field label="Onde aparece">
                <select name="popupPages" defaultValue={popup.pages} className={field}>
                  <option value="all">Em qualquer página</option>
                  <option value="home">Só na página inicial</option>
                </select>
              </Field>
            </div>
          </div>
        </Panel>
        <div>
          <SubmitButton>Salvar aparência</SubmitButton>
        </div>
      </form>
    </div>
  );
}
