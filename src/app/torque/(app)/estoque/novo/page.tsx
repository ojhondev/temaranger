import Link from "next/link";

import { VehicleForm } from "@/components/torque/vehicle-form";
import { PageHeader } from "@/components/torque/ui";
import { listStores } from "@/db/queries";
import { requireSession } from "@/lib/auth";
import { demoVehiclesLeft } from "@/lib/sandbox";
import { getTenant } from "@/lib/tenant";

export const metadata = { title: "Cadastrar veículo" };

export default async function NovoVeiculo({ searchParams }: { searchParams: Promise<{ erro?: string; limite?: string }> }) {
  await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const stores = await listStores(tenant.id);
  const { erro } = await searchParams;
  const left = await demoVehiclesLeft(tenant.id);
  if (left === 0) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Cadastrar veículo" kicker="Estoque" />
        <div className="rounded-xl bg-white p-6 shadow-[0_1px_3px_rgba(16,16,24,.06)]">
          <p className="font-semibold">Você já cadastrou o veículo da demonstração.</p>
          <p className="mt-1 text-sm text-[#6b6b76]">Ele já está no seu site e nos portais conectados. Na versão contratada, o cadastro é ilimitado.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/torque/estoque" className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold leading-10 text-white">Ver estoque</Link>
            <a href="/" target="_blank" className="h-10 rounded-lg border border-[#d6d6dc] px-4 text-sm font-semibold leading-10">Ver no site</a>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <PageHeader title="Cadastrar veículo" kicker="Estoque" />
      <p className="-mt-3 mb-5 text-sm text-[#6b6b76]">Ao salvar, o carro entra no site e nos portais conectados com “todo o estoque”.</p>
      {erro && <p className="mb-4 text-sm font-medium text-primary">Preencha loja, marca, modelo, ano e preço.</p>}
      <VehicleForm stores={stores} tenantId={tenant.id} />
    </div>
  );
}
