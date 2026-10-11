import Link from "next/link";
import { Plus } from "lucide-react";

import { VehicleStatusBadge } from "@/components/painel/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAdminVehicles } from "@/db/queries";
import { MARKETPLACES, brl, daysSince, km } from "@/lib/format";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

export default async function Estoque() {
  const tenant = await getTenant();
  const rows = await listAdminVehicles(tenant.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Estoque</h1>
        <Link href="/painel/estoque/novo" className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
          <Plus className="size-4" /> Novo veículo
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Veículo</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">No estoque</TableHead>
              <TableHead>Portais</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ vehicle: v, store, listings }) => {
              const age = daysSince(v.stockedAt);
              return (
                <TableRow key={v.id}>
                  <TableCell>
                    <Link href={`/painel/estoque/${v.id}`} className="font-semibold hover:underline">
                      {v.brand} {v.model} {v.year}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {v.version} · {km(v.km)}
                    </p>
                  </TableCell>
                  <TableCell>{store.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{brl(v.price)}</TableCell>
                  <TableCell>
                    <VehicleStatusBadge status={v.status} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      v.status !== "sold" && age > 60 && "font-semibold text-destructive",
                    )}
                  >
                    {v.status === "sold" ? "—" : `${age} dias`}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {listings
                        .filter((l) => l.status === "published" || l.status === "paused")
                        .map((l) => (
                          <span
                            key={l.id}
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[11px] font-semibold",
                              l.status === "published" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-800",
                            )}
                          >
                            {MARKETPLACES[l.marketplace]}
                          </span>
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
