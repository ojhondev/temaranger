"use client";

import { useState } from "react";

import { field } from "./ui";

const PRESETS = ["#e3173e", "#c8102e", "#1f4fbf", "#0f766e", "#16a34a", "#ea580c", "#7c3aed", "#111827"];

export function ColorField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [color, setColor] = useState(defaultValue);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-[#d6d6dc] bg-white p-1" aria-label="Escolher cor" />
        <input name={name} value={color} onChange={(e) => setColor(e.target.value)} pattern="#[0-9a-fA-F]{6}" className={field} />
      </div>
      <div className="flex gap-1.5">
        {PRESETS.map((c) => (
          <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Usar ${c}`} className="size-6 rounded-full border-2 border-white shadow ring-1 ring-black/10" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}
