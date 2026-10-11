import Link from "next/link";

import type { Tenant } from "@/db/schema";
import { cn } from "@/lib/utils";

export function Logo({ tenant, className }: { tenant: Tenant; className?: string }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center", className)} aria-label={tenant.name}>
      {tenant.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={tenant.logoUrl} alt={tenant.name} className="h-7 w-auto sm:h-8" />
      ) : (
        <span className="font-heading text-xl font-bold tracking-tight">{tenant.name}</span>
      )}
    </Link>
  );
}
