import Link from "next/link";

import { CarImage } from "@/components/car-image";

import { Rail } from "./rail";

const TYPES = [
  { label: "Caminhões leves", body: "Van/Utilitário", color: "Branco" },
  { label: "Conversível", body: "Conversível", color: "Branco" },
  { label: "Coupé", body: "Cupê", color: "Branco" },
  { label: "Hatch", body: "Hatch", color: "Branco" },
  { label: "Perua", body: "Perua/SW", color: "Branco" },
  { label: "Sedã", body: "Sedã", color: "Branco" },
  { label: "SUV", body: "SUV", color: "Branco" },
  { label: "Van/Utilitário", body: "Van/Utilitário", color: "Branco" },
  { label: "Picape", body: "Picape", color: "Branco" },
  { label: "Minivan", body: "Minivan", color: "Branco" },
];

export function BodyTypes() {
  return (
    <section>
      <h2 className="px-5 text-base font-bold text-[#1f1f1f]">Tipos de carroceria</h2>
      <Rail arrows="both" className="mt-3 px-5">
        {TYPES.map((t) => (
          <Link
            key={t.label}
            href={`/estoque?carroceria=${encodeURIComponent(t.body)}`}
            className="flex h-[132px] w-[156px] shrink-0 snap-start flex-col rounded-md bg-[#f2f3f5] p-3 transition hover:bg-[#e9eaee]"
          >
            <span className="text-xs font-semibold text-[#1f1f1f]">{t.label}</span>
            <CarImage bare color={t.color} body={t.body} className="mt-auto [&_svg]:w-[92%]" />
          </Link>
        ))}
      </Rail>
    </section>
  );
}
