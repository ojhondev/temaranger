import { asc, eq } from "drizzle-orm";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

import { bannerAction, saveBanner } from "@/app/torque/actions/site";
import { ConfirmButton } from "@/components/torque/confirm-button";
import { SingleImageUpload } from "@/components/torque/image-upload";
import { SiteTabs } from "@/components/torque/site-tabs";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { db } from "@/db";
import { banners, type Banner } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

export const metadata = { title: "Site · Banners" };

function BannerForm({ tenantId, banner, placement }: { tenantId: number; banner?: Banner; placement: "hero" | "promo" }) {
  return (
    <form action={saveBanner} className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <input type="hidden" name="placement" value={placement} />
      <div>
        <SingleImageUpload
          name="imageUrl"
          folder={`lojas/${tenantId}/banners`}
          defaultValue={banner?.imageUrl}
          aspect={placement === "hero" ? "aspect-[16/5]" : "aspect-[7/2]"}
          hint={placement === "hero" ? "Ideal 1600×500 px. Sem imagem, usa o fundo do tema." : "Ideal 1400×400 px."}
        />
      </div>
      <div className="grid gap-3">
        {placement === "promo" && (
          <Field label="Chamada acima do banner">
            <input name="heading" defaultValue={banner?.heading ?? ""} placeholder="Vai comprar ou vender?" className={field} />
          </Field>
        )}
        <Field label="Título *">
          <input name="title" required defaultValue={banner?.title} placeholder="Seu próximo SUV em até 60x" className={field} />
        </Field>
        <Field label="Subtítulo">
          <input name="subtitle" defaultValue={banner?.subtitle ?? ""} className={field} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Texto do botão">
            <input name="ctaLabel" defaultValue={banner?.ctaLabel ?? ""} placeholder="Ver ofertas" className={field} />
          </Field>
          <Field label="Link do botão" hint="Ex.: /estoque?carroceria=SUV">
            <input name="href" defaultValue={banner?.href ?? ""} placeholder="/estoque" className={field} />
          </Field>
        </div>
        <div>
          <SubmitButton>{banner ? "Salvar banner" : "Publicar banner"}</SubmitButton>
        </div>
      </div>
    </form>
  );
}

function BannerList({ list, tenantId, edit }: { list: Banner[]; tenantId: number; edit?: number }) {
  if (!list.length) return <p className="py-6 text-center text-sm text-[#6b6b76]">Nenhum banner cadastrado: o site usa os banners padrão do tema.</p>;
  return (
    <ul className="flex flex-col divide-y">
      {list.map((b) => (
        <li key={b.id} className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="relative h-16 w-48 shrink-0 overflow-hidden rounded-md bg-[linear-gradient(100deg,#2b2f36,#8a919b)]">
              {b.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
              )}
            </span>
            <div className={cn("min-w-0 flex-1", !b.active && "opacity-50")}>
              <p className="font-semibold">{b.title}</p>
              <p className="truncate text-xs text-[#6b6b76]">
                {b.subtitle} {b.href && `· ${b.ctaLabel ?? "Botão"} → ${b.href}`}
              </p>
              {!b.active && <p className="text-xs font-semibold text-[#6b6b76]">Fora do ar</p>}
            </div>
            <div className="flex items-center gap-1">
              {(
                [
                  ["up", ArrowUp, "Subir"],
                  ["down", ArrowDown, "Descer"],
                  ["toggle", b.active ? EyeOff : Eye, b.active ? "Tirar do ar" : "Colocar no ar"],
                  ["delete", Trash2, "Excluir"],
                ] as const
              ).map(([op, Icon, label]) => (
                <form key={op} action={bannerAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="op" value={op} />
                  {op === "delete" ? (
                    <ConfirmButton message="Excluir este banner?" aria-label={label} title={label} className="grid size-9 place-items-center rounded-lg text-primary hover:bg-[#f5f5f7]">
                      <Icon className="size-4" />
                    </ConfirmButton>
                  ) : (
                    <button aria-label={label} title={label} className="grid size-9 place-items-center rounded-lg hover:bg-[#f5f5f7]">
                      <Icon className="size-4" />
                    </button>
                  )}
                </form>
              ))}
              <a href={`?editar=${b.id}#editar`} aria-label="Editar" title="Editar" className="grid size-9 place-items-center rounded-lg hover:bg-[#f5f5f7]">
                <Pencil className="size-4" />
              </a>
            </div>
          </div>
          {edit === b.id && (
            <div id="editar" className="mt-4 rounded-xl border border-dashed border-[#d6d6dc] p-4">
              <BannerForm tenantId={tenantId} banner={b} placement={b.placement} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function SiteBanners({ searchParams }: { searchParams: Promise<{ salvo?: string; erro?: string; editar?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const all = await db.select().from(banners).where(eq(banners.tenantId, tenant.id)).orderBy(asc(banners.position), asc(banners.id));
  const { salvo, erro, editar } = await searchParams;
  const edit = Number(editar) || undefined;

  return (
    <div className="max-w-6xl">
      <PageHeader title="Site" kicker="Banners de ofertas" />
      <SiteTabs active="/torque/site/banners" />
      <Saved show={!!salvo} />
      {erro && <p className="mb-4 text-sm text-primary">O banner precisa de um título.</p>}

      <div className="flex flex-col gap-5">
        <Panel data-tour="banner-novo">
          <h2 className="text-base font-semibold">Novo banner do topo</h2>
          <p className="mb-4 text-sm text-[#6b6b76]">O carrossel grande da página inicial. Os banners giram a cada 6 segundos.</p>
          <BannerForm tenantId={tenant.id} placement="hero" />
        </Panel>

        <Panel data-tour="banner-lista">
          <h2 className="text-base font-semibold">Banners do topo</h2>
          <BannerList list={all.filter((b) => b.placement === "hero")} tenantId={tenant.id} edit={edit} />
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold">Banners promocionais</h2>
          <p className="mb-2 text-sm text-[#6b6b76]">Os dois banners lado a lado no meio da página inicial.</p>
          <BannerList list={all.filter((b) => b.placement === "promo")} tenantId={tenant.id} edit={edit} />
          {all.filter((b) => b.placement === "promo").length < 2 && (
            <div className="mt-4 rounded-xl border border-dashed border-[#d6d6dc] p-4">
              <p className="mb-3 text-sm font-semibold">Adicionar banner promocional</p>
              <BannerForm tenantId={tenant.id} placement="promo" />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
