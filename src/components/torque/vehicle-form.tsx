import { saveVehicle } from "@/app/torque/actions/inventory";
import { PhotosUpload } from "@/components/torque/image-upload";
import { Field, Panel, SubmitButton, field } from "@/components/torque/ui";
import { BODY_TYPES, COMMON_OPTIONALS } from "@/config/ranger";
import type { Store, Vehicle } from "@/db/schema";

function Select({ name, value, options }: { name: string; value?: string | null; options: string[] }) {
  return (
    <select name={name} defaultValue={value ?? options[0]} className={field}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function Check({ name, label, checked, hint }: { name: string; label: string; checked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#e2e2e8] p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-[#eef1fd]">
      <input type="checkbox" name={name} defaultChecked={checked} className="mt-0.5 size-4 accent-[#4f6be6]" />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-[#6b6b76]">{hint}</span>}
      </span>
    </label>
  );
}

/** Cadastro/edição completa do veículo no Torque. */
export function VehicleForm({ vehicle: v, stores, tenantId }: { vehicle?: Vehicle; stores: Store[]; tenantId: number }) {
  const extra = (v?.optionals ?? []).filter((o) => !COMMON_OPTIONALS.includes(o));
  return (
    <form action={saveVehicle} className="flex flex-col gap-5">
      {v && <input type="hidden" name="id" value={v.id} />}

      <Panel data-tour="fotos">
        <h2 className="mb-4 text-base font-semibold">Fotos</h2>
        <PhotosUpload name="photos" folder={`lojas/${tenantId}/veiculos`} defaultValue={v?.photos ?? []} />
      </Panel>

      <Panel data-tour="ficha">
        <h2 className="mb-4 text-base font-semibold">Ficha do veículo</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Tipo">
            <select name="type" defaultValue={v?.type ?? "car"} className={field}>
              <option value="car">Carro</option>
              <option value="moto">Moto</option>
            </select>
          </Field>
          <Field label="Loja *">
            <select name="storeId" required defaultValue={v?.storeId ?? stores[0]?.id} className={field}>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Placa" hint="Não aparece no site.">
            <input name="plate" defaultValue={v?.plate ?? ""} placeholder="ABC1D23" className={field} />
          </Field>
          <Field label="Cor">
            <input name="color" defaultValue={v?.color ?? ""} placeholder="Branco" className={field} />
          </Field>
          <Field label="Marca *">
            <input name="brand" required defaultValue={v?.brand} placeholder="Jeep" className={field} />
          </Field>
          <Field label="Modelo *">
            <input name="model" required defaultValue={v?.model} placeholder="Compass" className={field} />
          </Field>
          <Field label="Versão" className="sm:col-span-2">
            <input name="version" defaultValue={v?.version ?? ""} placeholder="2.0 Longitude Diesel 4x4" className={field} />
          </Field>
          <Field label="Ano de fabricação *">
            <input name="year" required inputMode="numeric" defaultValue={v?.year} placeholder="2022" className={field} />
          </Field>
          <Field label="Ano do modelo">
            <input name="yearModel" inputMode="numeric" defaultValue={v?.yearModel ?? ""} placeholder="2023" className={field} />
          </Field>
          <Field label="Quilometragem">
            <input name="km" inputMode="numeric" defaultValue={v?.km} placeholder="45000" className={field} />
          </Field>
          <Field label="Carroceria">
            <Select name="bodyType" value={v?.bodyType} options={[...BODY_TYPES, "Street", "Trail", "Scooter"]} />
          </Field>
          <Field label="Câmbio">
            <Select name="transmission" value={v?.transmission} options={["Automático", "Manual", "CVT", "Automatizado"]} />
          </Field>
          <Field label="Combustível">
            <Select name="fuel" value={v?.fuel} options={["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido", "Gasolina e elétrico"]} />
          </Field>
          <Field label="Preço (R$) *">
            <input name="price" required inputMode="numeric" defaultValue={v?.price} placeholder="129900" className={field} />
          </Field>
          <Field label="Tabela FIPE (R$)">
            <input name="fipePrice" inputMode="numeric" defaultValue={v?.fipePrice ?? ""} className={field} />
          </Field>
          <Field label="Descrição / observações" className="sm:col-span-2 xl:col-span-4">
            <textarea name="description" rows={3} defaultValue={v?.description ?? ""} className={`${field} h-auto py-3`} />
          </Field>
        </div>
      </Panel>

      <Panel>
        <h2 className="mb-4 text-base font-semibold">Itens e opcionais</h2>
        <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {COMMON_OPTIONALS.map((o) => (
            <label key={o} className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" name="optionals" value={o} defaultChecked={v?.optionals.includes(o)} className="size-4 accent-[#4f6be6]" />
              {o}
            </label>
          ))}
        </div>
        <Field label="Outros itens (separe por vírgula)" className="mt-5">
          <input name="extraOptionals" defaultValue={extra.join(", ")} placeholder="Engate, Película, Kit multimídia" className={field} />
        </Field>
      </Panel>

      <Panel data-tour="vitrine">
        <h2 className="mb-4 text-base font-semibold">Vitrine e diferenciais</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Check name="featured" label="Destaque" checked={v?.featured} hint="Aparece primeiro e com selo roxo." />
          <Check name="acceptsTrade" label="Aceita troca" checked={v ? v.acceptsTrade : true} />
          <Check name="factoryWarranty" label="Garantia de fábrica" checked={v?.factoryWarranty} />
          <Check name="hasHistoryReport" label="Histórico veicular" checked={v?.hasHistoryReport} hint="Selo verde na foto." />
        </div>
        <Field label="Selo de campanha" hint="Ex.: Festival de carros, Abaixo da FIPE, Feirão. Deixe vazio para não mostrar." className="mt-4 max-w-md">
          <input name="tag" defaultValue={v?.tag ?? ""} className={field} />
        </Field>
      </Panel>

      <div className="sticky bottom-16 z-10 flex justify-end rounded-xl bg-white/90 p-3 shadow-[0_-4px_20px_rgba(0,0,0,.06)] backdrop-blur md:bottom-4">
        <SubmitButton>{v ? "Salvar alterações" : "Cadastrar veículo"}</SubmitButton>
      </div>
    </form>
  );
}
