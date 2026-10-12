import { BodyTypes } from "@/components/ranger/body-types";
import { HeaderHome } from "@/components/ranger/header-home";
import { HeroCarousel } from "@/components/ranger/hero-carousel";
import { ModelsSection } from "@/components/ranger/models-section";
import { PromoBanners } from "@/components/ranger/promo-banners";
import { Rail } from "@/components/ranger/rail";
import { SellBanner } from "@/components/ranger/sell-banner";
import { VehicleCard } from "@/components/site/vehicle-card";
import { QuickSearch } from "@/components/ranger/quick-search";
import { listBrands, listModels, listPublicVehicles } from "@/db/queries";
import { brandLogo } from "@/lib/brands";
import { activeBanners, settingsOf, whatsappLink } from "@/lib/settings";
import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const CARD = "w-[calc(50%-10px)] shrink-0 snap-start sm:w-[214px] 2xl:w-[248px]";

export default async function Home() {
  const tenant = await getTenant();
  const st = settingsOf(tenant);
  const [models, offers, recent, hero, promos, brands] = await Promise.all([
    listModels(tenant.id),
    listPublicVehicles(tenant.id, {}, 16),
    listPublicVehicles(tenant.id, { ordem: "recentes", kmMax: "1" }, 16),
    activeBanners(tenant, "hero"),
    activeBanners(tenant, "promo"),
    listBrands(tenant.id, "car"),
  ]);
  // "Taxas especiais": anúncios com selo de campanha primeiro.
  const financing = [...offers].sort((a, b) => Number(!!b.vehicle.tag) - Number(!!a.vehicle.tag));
  const show = st.sections;

  return (
    <>
      <HeaderHome tenant={tenant} chips />

      <main className="flex flex-col gap-8 px-4 pb-8 pt-2 sm:gap-12 sm:px-6 sm:pt-6 lg:px-10 2xl:px-14">
        <div data-tour="site-banner">
          <HeroCarousel banners={hero} />
        </div>
        <QuickSearch brands={brands} />

        {show.models && (
          <div data-tour="site-modelos">
            <ModelsSection
              models={models.map((v) => ({
                brand: v.brand,
                model: v.model,
                body: v.bodyType,
                color: v.color,
                photo: v.photos[0] ?? null,
                logo: brandLogo(v.brand),
              }))}
            />
          </div>
        )}
      </main>

      <div className="flex flex-col gap-14 px-4 pb-8 sm:px-6 lg:px-10 2xl:px-14">
        {show.financing && financing.length > 0 && (
          <section data-tour="site-ofertas">
            <h2 className="text-base font-bold text-[#1f1f1f]">Carros para financiar com taxas especiais</h2>
            <Rail className="mt-3">
              {financing.map((r) => (
                <VehicleCard key={r.vehicle.id} {...r} className={CARD} />
              ))}
            </Rail>
          </section>
        )}

        {show.promos && (
          <PromoBanners items={promos} whatsappHref={whatsappLink(tenant.whatsapp, "Olá! Quero simular um financiamento.")} />
        )}

        {show.sell && (
          <div data-tour="site-vender">
            <SellBanner whatsapp={tenant.whatsapp} title={st.sellBanner.title} subtitle={st.sellBanner.subtitle} cta={st.sellBanner.cta} />
          </div>
        )}

        {show.zeroKm && recent.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#1f1f1f]">0 km a pronta entrega</h2>
            <Rail className="mt-3">
              {recent.map((r) => (
                <VehicleCard key={r.vehicle.id} {...r} className={CARD} />
              ))}
            </Rail>
          </section>
        )}

        {show.bodyTypes && <BodyTypes />}
      </div>
    </>
  );
}
