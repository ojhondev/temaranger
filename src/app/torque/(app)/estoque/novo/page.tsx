import { VehicleForm } from "@/components/torque/vehicle-form";
import { PageHeader } from "@/components/torque/ui";
import { listStores } from "@/db/queries";
import { requireSession } from "@/lib/auth";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Cadastrar veículo" };

export default async function NovoVeiculo({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const stores = await listStores(tenant.id);
  const { erro } = await searchParams;
  return (
    <div>
      <PageHeader title="Cadastrar veículo" kicker="Estoque" />
      <p className="-mt-3 mb-5 text-sm text-[#6b6b76]">Ao salvar, o carro entra no site e nos portais conectados com “todo o estoque”.</p>
      {erro && <p className="mb-4 text-sm font-medium text-primary">Preencha loja, marca, modelo, ano e preço.</p>}
      <VehicleForm stores={stores} tenantId={tenant.id} />
    </div>
  );
}
