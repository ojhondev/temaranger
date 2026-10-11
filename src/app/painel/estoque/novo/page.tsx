import { VehicleForm } from "@/components/painel/vehicle-form";
import { listStores } from "@/db/queries";
import { getTenant } from "@/lib/tenant";

export default async function NovoVeiculo({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const tenant = await getTenant();
  const stores = await listStores(tenant.id);
  const { erro } = await searchParams;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Novo veículo</h1>
        <p className="text-sm text-muted-foreground">
          Ao cadastrar, o carro entra no site e é publicado em OLX, WebMotors e Mercado Livre.
        </p>
      </div>
      {erro && <p className="text-sm text-destructive">Preencha os campos obrigatórios (*).</p>}
      <VehicleForm stores={stores} />
    </div>
  );
}
