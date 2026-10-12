import { cn } from "@/lib/utils";

/** Liga/desliga em linha, no padrão das telas do Site. */
export function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-[#e2e2e8] px-4 py-3 text-sm has-[:checked]:border-primary">
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-[#6b6b76]">{hint}</span>}
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 shrink-0 accent-[#ff3916]" />
    </label>
  );
}

/** Cartões de escolha única (radio), com ilustração ou descrição. */
export function ChoiceCards<T extends string>({
  name,
  value,
  options,
  className,
}: {
  name: string;
  value: T;
  options: { value: T; label: string; hint?: string; art?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {options.map((o) => (
        <label
          key={o.value}
          className="flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-[#e2e2e8] p-4 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-[#fff0ec]"
        >
          {o.art}
          <span className="flex items-center gap-2 font-semibold">
            <input type="radio" name={name} value={o.value} defaultChecked={o.value === value} className="size-4 accent-[#ff3916]" />
            {o.label}
          </span>
          {o.hint && <span className="text-xs text-[#6b6b76]">{o.hint}</span>}
        </label>
      ))}
    </div>
  );
}
