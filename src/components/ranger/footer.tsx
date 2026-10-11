import Link from "next/link";

import type { Store, Tenant } from "@/db/schema";

export function Footer({ tenant, stores }: { tenant: Tenant; stores: Store[] }) {
  return (
    <footer id="lojas" className="mt-16 border-t bg-[#f5f6f7]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 md:grid-cols-[1.2fr_2fr] lg:px-[5.5%]">
        <div>
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logoUrl} alt={tenant.name} className="h-8 w-auto" />
          ) : (
            <p className="font-heading text-xl font-bold">{tenant.name}</p>
          )}
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Seminovos multimarcas revisados, com procedência e garantia.
          </p>
          <div className="mt-4 flex gap-4 text-sm font-semibold">
            <Link href="/estoque" className="hover:text-primary">
              Carros
            </Link>
            <Link href="/estoque?tipo=motos" className="hover:text-primary">
              Motos
            </Link>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {stores.map((s) => (
            <div key={s.id} className="text-sm">
              <p className="font-heading font-semibold">{s.name}</p>
              <p className="text-muted-foreground">{s.address}</p>
              <p className="text-muted-foreground">{s.city}</p>
              {s.whatsapp && (
                <a
                  href={`https://wa.me/${s.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-semibold text-primary"
                >
                  WhatsApp da loja
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {tenant.name}. Tema Ranger · Plataforma SoftMotors
      </p>
    </footer>
  );
}
