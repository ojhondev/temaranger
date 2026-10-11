import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  branco: "#e7e9ec",
  preto: "#1f2226",
  prata: "#b7bcc3",
  cinza: "#6b7280",
  vermelho: "#c81e1e",
  azul: "#1d4ed8",
  verde: "#2f6b4a",
  laranja: "#ea7a1d",
};

/** Ilustração do veículo enquanto o módulo de fotos não existe. */
export function CarImage({
  color,
  body,
  className,
}: {
  color?: string | null;
  body?: string | null;
  className?: string;
}) {
  const fill = COLORS[(color ?? "").toLowerCase()] ?? "#9ca3af";
  const tall = body === "SUV" || body === "Picape";
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-end justify-center overflow-hidden bg-gradient-to-b from-neutral-100 to-neutral-200",
        className,
      )}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-neutral-300/60" />
      <svg viewBox="0 0 200 90" className="relative mb-[9%] w-[78%] drop-shadow-xl" aria-hidden>
        <path
          d={
            tall
              ? "M8 66 L10 46 Q12 40 22 38 L48 34 L66 16 Q70 12 78 12 L138 12 Q146 12 152 18 L170 36 L186 40 Q194 42 194 52 L194 66 Z"
              : "M8 66 L10 52 Q12 46 22 44 L52 40 L72 24 Q78 20 86 20 L132 20 Q140 20 146 26 L164 40 L184 44 Q194 46 194 56 L194 66 Z"
          }
          fill={fill}
          stroke="rgba(0,0,0,.25)"
          strokeWidth="1"
        />
        <path
          d={tall ? "M72 18 L138 18 Q144 18 148 22 L162 36 L58 36 Z" : "M78 26 L132 26 Q138 26 142 30 L156 42 L62 42 Z"}
          fill="#1e293b"
          opacity=".75"
        />
        <circle cx="48" cy="68" r="15" fill="#111" />
        <circle cx="48" cy="68" r="7" fill="#9ca3af" />
        <circle cx="156" cy="68" r="15" fill="#111" />
        <circle cx="156" cy="68" r="7" fill="#9ca3af" />
      </svg>
    </div>
  );
}
