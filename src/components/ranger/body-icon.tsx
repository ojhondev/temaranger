/** Ícone de carroceria usado nos chips (carro de perfil com linhas de velocidade). */
export function BodyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 16h-1.5a1 1 0 0 1-1-1v-2.2a1 1 0 0 1 .7-.95l2.3-.75 2.6-2.6a2 2 0 0 1 1.4-.6h4.1a2 2 0 0 1 1.6.8l1.8 2.4 1.9.5a1 1 0 0 1 .7.95V15a1 1 0 0 1-1 1H18" />
      <circle cx="8" cy="16" r="1.8" />
      <circle cx="16" cy="16" r="1.8" />
      <path d="M10 16h4M2 9h3M1 12h2" />
    </svg>
  );
}
