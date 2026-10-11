"use client";

import { upload } from "@vercel/blob/client";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

async function send(file: File, folder: string) {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const blob = await upload(`${folder}/${safe}`, file, { access: "public", handleUploadUrl: "/api/torque/upload" });
  return blob.url;
}

/**
 * Uma imagem (logo, banner): mostra a atual, troca ao escolher outra e grava a URL num
 * input escondido `name`, enviado junto com o formulário.
 */
export function SingleImageUpload({
  name,
  folder,
  defaultValue,
  aspect = "aspect-[16/5]",
  hint,
  contain,
}: {
  name: string;
  folder: string;
  defaultValue?: string | null;
  aspect?: string;
  hint?: string;
  contain?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files?.[0]) return;
    setBusy(true);
    setError("");
    try {
      setUrl(await send(files[0], folder));
    } catch (e) {
      setError((e as Error).message || "Não foi possível enviar a imagem.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn(
          "group relative flex w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[#d6d6dc] bg-[#fafafb] hover:border-primary",
          aspect,
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className={cn("absolute inset-0 size-full", contain ? "object-contain p-4" : "object-cover")} />
        ) : (
          <span className="flex flex-col items-center gap-1 text-sm text-[#6b6b76]">
            <ImagePlus className="size-6" /> Escolher imagem
          </span>
        )}
        {url && (
          <span className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
            Trocar imagem
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="size-6 animate-spin text-primary" />
          </span>
        )}
      </button>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files)} />
      <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-[#6b6b76]">
        <span>{error ? <span className="text-primary">{error}</span> : hint}</span>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="font-semibold text-primary hover:underline">
            Remover
          </button>
        )}
      </div>
    </div>
  );
}

/** Galeria do veículo: várias fotos, capa = primeira, reordenar e excluir. Grava JSON em `name`. */
export function PhotosUpload({ name, folder, defaultValue }: { name: string; folder: string; defaultValue: string[] }) {
  const [photos, setPhotos] = useState<string[]>(defaultValue);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const list = [...files];
    setBusy(list.length);
    for (const f of list) {
      try {
        const url = await send(f, folder);
        setPhotos((p) => [...p, url]);
      } catch (e) {
        setError((e as Error).message || "Alguma foto não pôde ser enviada.");
      } finally {
        setBusy((b) => b - 1);
      }
    }
  }

  const move = (i: number, d: -1 | 1) =>
    setPhotos((p) => {
      const n = [...p];
      const j = i + d;
      if (j < 0 || j >= n.length) return p;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(photos)} />
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onPick(e.dataTransfer.files);
        }}
      >
        {photos.map((url, i) => (
          <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-[#fafafb]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                <Star className="size-3" /> Capa
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1 opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} aria-label="Mover para a esquerda" className="grid size-7 place-items-center text-white">
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPhotos((p) => p.filter((x) => x !== url))}
                aria-label="Excluir foto"
                className="grid size-7 place-items-center text-white"
              >
                <Trash2 className="size-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Mover para a direita" className="grid size-7 place-items-center text-white">
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: busy }, (_, i) => (
          <div key={`b${i}`} className="grid aspect-[4/3] place-items-center rounded-lg border bg-[#fafafb]">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#d6d6dc] text-sm text-[#6b6b76] hover:border-primary hover:text-primary"
        >
          <ImagePlus className="size-6" /> Adicionar fotos
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPick(e.target.files)} />
      <p className="mt-2 text-xs text-[#6b6b76]">
        {error ? <span className="text-primary">{error}</span> : "Arraste as fotos aqui ou clique em adicionar. A primeira é a capa do anúncio."}
      </p>
    </div>
  );
}
