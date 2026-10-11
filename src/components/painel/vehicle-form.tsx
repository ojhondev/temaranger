import { saveVehicle } from "@/app/painel/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Store, Vehicle } from "@/db/schema";

const SELECT = "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function VehicleForm({ vehicle: v, stores }: { vehicle?: Vehicle; stores: Store[] }) {
  return (
    <form action={saveVehicle} className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2 xl:grid-cols-4">
      {v && <input type="hidden" name="id" value={v.id} />}
      <Field label="Placa">
        <Input name="plate" defaultValue={v?.plate ?? ""} placeholder="ABC1D23" />
      </Field>
      <Field label="Loja *">
        <select name="storeId" required defaultValue={v?.storeId ?? stores[0]?.id} className={SELECT}>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Marca *">
        <Input name="brand" required defaultValue={v?.brand} placeholder="Volkswagen" />
      </Field>
      <Field label="Modelo *">
        <Input name="model" required defaultValue={v?.model} placeholder="T-Cross" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Versão">
          <Input name="version" defaultValue={v?.version ?? ""} placeholder="1.0 200 TSI Highline" />
        </Field>
      </div>
      <Field label="Ano *">
        <Input name="year" required inputMode="numeric" defaultValue={v?.year} />
      </Field>
      <Field label="Km">
        <Input name="km" inputMode="numeric" defaultValue={v?.km} />
      </Field>
      <Field label="Preço (R$) *">
        <Input name="price" required inputMode="numeric" defaultValue={v?.price} />
      </Field>
      <Field label="FIPE (R$)">
        <Input name="fipePrice" inputMode="numeric" defaultValue={v?.fipePrice ?? ""} />
      </Field>
      <Field label="Cor">
        <Input name="color" defaultValue={v?.color ?? ""} />
      </Field>
      <Field label="Câmbio">
        <select name="transmission" defaultValue={v?.transmission ?? "Automático"} className={SELECT}>
          {["Automático", "Manual", "CVT", "Automatizado"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Combustível">
        <select name="fuel" defaultValue={v?.fuel ?? "Flex"} className={SELECT}>
          {["Flex", "Gasolina", "Diesel", "Elétrico", "Híbrido"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Carroceria">
        <select name="bodyType" defaultValue={v?.bodyType ?? "Hatch"} className={SELECT}>
          {["Hatch", "Sedã", "SUV", "Picape", "Minivan", "Coupé"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <div className="sm:col-span-2 xl:col-span-4">
        <Field label="Descrição">
          <Textarea name="description" rows={3} defaultValue={v?.description ?? ""} />
        </Field>
      </div>
      <div className="sm:col-span-2 xl:col-span-4">
        <Button type="submit" size="lg">
          {v ? "Salvar alterações" : "Cadastrar e publicar"}
        </Button>
      </div>
    </form>
  );
}
