/** Rosca simples (SVG) para os cards do Início. */
export function Donut({ segments, size = 132, thickness = 30 }: { segments: { value: number; color: string }[]; size?: number; thickness?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="size-24 shrink-0 -rotate-90 sm:size-auto" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#efeff3" strokeWidth={thickness} />
      {total > 0 &&
        segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
    </svg>
  );
}
