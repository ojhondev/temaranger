import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  branco: "#eceef1",
  preto: "#1d1f23",
  prata: "#bfc4ca",
  cinza: "#5f6670",
  vermelho: "#c8102e",
  azul: "#1f4fbf",
  verde: "#2f6b4a",
  laranja: "#ea7a1d",
};

type Shape = { body: string; glass: string; wheel: number };

const SHAPES: Record<string, Shape> = {
  sedan: {
    body: "M6 66 L7 52 Q8 47 17 46 L52 44 L74 26 Q80 22 88 22 L128 22 Q136 22 142 28 L160 42 L188 46 Q199 48 199 58 L199 66 Z",
    glass: "M82 27 L127 27 Q133 27 137 31 L151 42 L62 43 Z",
    wheel: 15,
  },
  hatch: {
    body: "M10 66 L11 42 Q13 30 26 26 L46 22 L118 21 Q128 21 136 28 L156 42 L186 46 Q197 48 197 58 L197 66 Z",
    glass: "M30 30 L48 26 L116 26 Q124 26 130 31 L145 42 L25 42 Z",
    wheel: 15,
  },
  suv: {
    body: "M8 64 L9 43 Q10 35 18 30 L38 16 Q42 13 49 13 L130 13 Q140 13 148 20 L168 36 L190 40 Q199 42 199 53 L199 64 Z",
    glass: "M40 20 Q44 18 50 18 L128 18 Q136 18 142 23 L156 35 L24 35 Z",
    wheel: 17,
  },
  pickup: {
    body: "M5 64 L5 40 L88 40 L88 17 Q88 12 96 12 L136 12 Q144 12 150 18 L168 37 L191 41 Q200 43 200 53 L200 64 Z",
    glass: "M95 17 L134 17 Q140 17 144 21 L156 35 L95 35 Z",
    wheel: 17,
  },
  van: {
    body: "M8 64 L8 13 Q8 7 16 7 L146 7 Q155 7 161 15 L181 39 Q198 43 198 53 L198 64 Z",
    glass: "M147 12 Q154 12 158 18 L171 36 L146 36 Z",
    wheel: 16,
  },
  convertible: {
    body: "M6 66 L7 50 Q8 45 17 44 L70 42 L84 32 L92 32 L96 42 L188 45 Q199 47 199 57 L199 66 Z",
    glass: "M84 33 L91 33 L94 41 L80 41 Z",
    wheel: 15,
  },
};

const BODY_SHAPE: Record<string, string> = {
  Hatch: "hatch",
  "Perua/SW": "hatch",
  SUV: "suv",
  Minivan: "suv",
  Picape: "pickup",
  "Van/Utilitário": "van",
  Conversível: "convertible",
};

/**
 * Ilustração de estúdio do veículo, usada enquanto a loja não sobe fotos.
 * `bare` remove o fundo (para banners).
 */
export function CarImage({
  color,
  body,
  type = "car",
  className,
  bare,
}: {
  color?: string | null;
  body?: string | null;
  type?: "car" | "moto";
  className?: string;
  bare?: boolean;
}) {
  const fill = COLORS[(color ?? "").toLowerCase()] ?? "#9ca3af";
  const shape = SHAPES[BODY_SHAPE[body ?? ""] ?? "sedan"];
  const r = shape.wheel;

  const art =
    type === "moto" ? (
      <svg viewBox="0 0 200 110" className="relative w-[62%] drop-shadow-[0_18px_14px_rgba(0,0,0,.28)]" aria-hidden>
        <circle cx="45" cy="80" r="24" fill="#16181c" />
        <circle cx="45" cy="80" r="11" fill="#a3a9b1" />
        <circle cx="158" cy="80" r="24" fill="#16181c" />
        <circle cx="158" cy="80" r="11" fill="#a3a9b1" />
        <path d="M45 80 L84 46 L128 46 L158 80" stroke="#2b2e33" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M72 44 Q92 26 122 32 L136 46 L84 50 Z" fill={fill} stroke="rgba(0,0,0,.25)" />
        <path d="M126 30 L146 18 L152 22" stroke="#2b2e33" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M60 40 L88 36" stroke="#1f2125" strokeWidth="9" strokeLinecap="round" />
      </svg>
    ) : (
      <svg viewBox="0 0 206 96" className="relative w-[80%] drop-shadow-[0_10px_8px_rgba(0,0,0,.22)]" aria-hidden>
        <ellipse cx="104" cy="87" rx="98" ry="5" fill="#000" opacity=".16" />
        <path d={shape.body} fill={fill} stroke="rgba(0,0,0,.22)" strokeWidth="1" />
        <path d={shape.glass} fill="#1b2433" opacity=".82" />
        <path d="M188 48 L198 50 L198 55 L188 54 Z" fill="#fff" opacity=".85" />
        <path d="M8 50 L16 49 L15 55 L8 56 Z" fill="#d11" opacity=".8" />
        <circle cx="48" cy={86 - r} r={r} fill="#141518" />
        <circle cx="48" cy={86 - r} r={r / 2} fill="#a3a9b1" />
        <circle cx="160" cy={86 - r} r={r} fill="#141518" />
        <circle cx="160" cy={86 - r} r={r / 2} fill="#a3a9b1" />
      </svg>
    );

  if (bare) return <div className={cn("flex items-center justify-center", className)}>{art}</div>;

  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#ffffff_0%,#eceef1_55%,#d9dce1_100%)]",
        className,
      )}
    >
      {art}
    </div>
  );
}

/** Foto real do veículo quando existir; senão, a ilustração. */
export function VehiclePhoto({
  vehicle,
  index = 0,
  className,
}: {
  vehicle: { photos: string[]; color: string | null; bodyType: string | null; type: "car" | "moto"; brand: string; model: string };
  index?: number;
  className?: string;
}) {
  const src = vehicle.photos[index];
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${vehicle.brand} ${vehicle.model}`}
        className={cn("aspect-[4/3] w-full object-cover", className)}
        loading="lazy"
      />
    );
  }
  return <CarImage color={vehicle.color} body={vehicle.bodyType} type={vehicle.type} className={className} />;
}
