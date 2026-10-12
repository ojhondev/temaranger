import { cn } from "@/lib/utils";

/** Ícone do Torque: um conta-giros na cor da marca SoftMotors. */
export function TorqueIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="14" fill="#ff3916" />
      <path d="M7 21a10 10 0 1 1 18 0" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M16 18 L22.5 10.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="16" cy="18" r="2.4" fill="#fff" />
    </svg>
  );
}

/** Logotipo "Torque" para o menu escuro. */
export function TorqueLogo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <TorqueIcon className="size-7 shrink-0" />
      {!collapsed && <span className="font-heading text-[19px] font-semibold tracking-tight text-white">Torque</span>}
    </span>
  );
}

/** Marca d'água dos cards: "crm.", "estoque."… com o ícone em vermelho. */
export function CardMark({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-heading text-[17px] font-semibold tracking-tight text-[#1f1f28]">
      <Icon className="size-[18px] text-primary" />
      {label}
      <span className="-ml-1 text-primary">.</span>
    </span>
  );
}
