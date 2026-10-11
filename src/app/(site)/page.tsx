import { BodyTypes } from "@/components/ranger/body-types";
import { HeaderHome } from "@/components/ranger/header-home";
import { HeroCarousel } from "@/components/ranger/hero-carousel";
import { ModelsSection } from "@/components/ranger/models-section";
import { PromoBanners } from "@/components/ranger/promo-banners";
import { Rail } from "@/components/ranger/rail";
import { SellBanner } from "@/components/ranger/sell-banner";
import { VehicleCard } from "@/components/site/vehicle-card";
import { HERO_BANNERS, fill } from "@/config/ranger";
import { listModels, listPublicVehicles } from "@/db/queries";
import { brandLogo } from "@/lib/brands";
import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tenant = await getTenant();
  const [models, offers, recent] = await Promise.all([
    listModels(tenant.id),
    listPublicVehicles(tenant.id, {}, 12),
    listPublicVehicles(tenant.id, { ordem: "recentes", kmMax: "1" }, 12),
  ]);
  // "Taxas especiais": anúncios com selo de campanha primeiro.
  const financing = [...offers].sort((a, b) => Number(!!b.vehicle.tag) - Number(!!a.vehicle.tag));
  const banners = HERO_BANNERS.map((b) => ({ ...b, title: fill(b.title, tenant.name), subtitle: fill(b.subtitle, tenant.name) }));

  return (
    <>
      <HeaderHome tenant={tenant} />

      <main className="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 pb-8 pt-6 lg:px-[7.5%]">
        <HeroCarousel banners={banners} />

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
      </main>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-14 px-4 pb-8 lg:px-[5.5%]">
        <section>
          <h2 className="text-base font-bold text-[#1f1f1f]">Carros para financiar com taxas especiais</h2>
          <Rail className="mt-3">
            {financing.map((r) => (
              <VehicleCard key={r.vehicle.id} {...r} className="w-[calc(50%-10px)] shrink-0 snap-start sm:w-[214px]" />
            ))}
          </Rail>
        </section>

        <PromoBanners whatsapp={tenant.whatsapp} />

        <SellBanner storeName={tenant.name} whatsapp={tenant.whatsapp} />

        {recent.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#1f1f1f]">0 km a pronta entrega</h2>
            <Rail className="mt-3">
              {recent.map((r) => (
                <VehicleCard key={r.vehicle.id} {...r} className="w-[calc(50%-10px)] shrink-0 snap-start sm:w-[214px]" />
              ))}
            </Rail>
          </section>
        )}

        <BodyTypes />
      </div>
    </>
  );
}
