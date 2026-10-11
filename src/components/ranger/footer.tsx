import Link from "next/link";
import { Mail, Phone } from "lucide-react";

import type { Store, Tenant } from "@/db/schema";
import type { ResolvedSettings } from "@/lib/settings";

export function Footer({ tenant, stores, settings: st }: { tenant: Tenant; stores: Store[]; settings: ResolvedSettings }) {
  const socials = [
    ["Instagram", st.instagram],
    ["Facebook", st.facebook],
    ["YouTube", st.youtube],
  ].filter(([, href]) => href) as [string, string][];

  return (
    <footer id="lojas" className="mt-16 border-t bg-[#f5f6f7]">
      <div className="grid gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-10 2xl:px-14">
        <div>
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logoUrl} alt={tenant.name} className="h-8 w-auto" />
          ) : (
            <p className="font-heading text-xl font-bold">{tenant.name}</p>
          )}
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{st.footerText}</p>
          <div className="mt-4 flex flex-col gap-1.5 text-sm">
            {st.phone && (
              <a href={`tel:${st.phone.replace(/\D/g, "")}`} className="flex items-center gap-2 hover:text-primary">
                <Phone className="size-4" /> {st.phone}
              </a>
            )}
            {st.email && (
              <a href={`mailto:${st.email}`} className="flex items-center gap-2 hover:text-primary">
                <Mail className="size-4" /> {st.email}
              </a>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/estoque" className="hover:text-primary">
              Carros
            </Link>
            <Link href="/estoque?tipo=motos" className="hover:text-primary">
              Motos
            </Link>
            {socials.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {stores.map((s) => (
            <div key={s.id} className="text-sm">
              <p className="font-heading font-semibold">{s.name}</p>
              <p className="text-muted-foreground">{s.address}</p>
              <p className="text-muted-foreground">{s.city}</p>
              {s.whatsapp && (
                <a
                  href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(st.whatsappMessage)}`}
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
