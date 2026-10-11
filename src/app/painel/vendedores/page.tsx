import { addSeller, toggleSeller } from "@/app/painel/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listSellers, listStores } from "@/db/queries";
import { getTenant } from "@/lib/tenant";

export default async function Vendedores() {
  const tenant = await getTenant();
  const [sellers, stores] = await Promise.all([listSellers(tenant.id), listStores(tenant.id)]);
  const storeName = (id: number | null) => stores.find((s) => s.id === id)?.name ?? "Todas";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Vendedores</h1>
        <p className="text-sm text-muted-foreground">
          Os leads de cada carro vão em rodízio para os vendedores ativos da loja dele.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>No rodízio</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sellers.map((s) => (
              <TableRow key={s.id} className={s.active ? "" : "opacity-50"}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{storeName(s.storeId)}</TableCell>
                <TableCell className="tabular-nums">{s.phone ?? "—"}</TableCell>
                <TableCell>{s.active ? "Sim" : "Pausado"}</TableCell>
                <TableCell className="text-right">
                  <form action={toggleSeller}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="active" value={s.active ? "0" : "1"} />
                    <Button type="submit" size="sm" variant="outline">
                      {s.active ? "Pausar" : "Reativar"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <form action={addSeller} className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-5">
        <p className="w-full font-heading font-bold">Adicionar vendedor</p>
        <Input name="name" required placeholder="Nome" className="w-56" />
        <Input name="phone" placeholder="WhatsApp com DDD" className="w-48" />
        <select name="storeId" className="h-8 rounded-lg border bg-card px-2 text-sm">
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <Button type="submit">Adicionar</Button>
      </form>
    </div>
  );
}
