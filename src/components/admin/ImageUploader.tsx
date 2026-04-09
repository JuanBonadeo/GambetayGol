"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export interface ProductImageEntry {
  url: string;
  orden: number;
  esPrincipal: boolean;
}

interface ImageUploaderProps {
  images: ProductImageEntry[];
  onChange: (images: ProductImageEntry[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    const uploaded: ProductImageEntry[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" no es una imagen válida.`);
        continue;
      }
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const { error: msg } = await res.json();
          setError(msg ?? "Error al subir imagen");
          continue;
        }
        const { url } = await res.json();
        uploaded.push({
          url,
          orden: images.length + uploaded.length,
          esPrincipal: images.length === 0 && uploaded.length === 0,
        });
      } catch {
        setError("Error de red al subir imagen.");
      }
    }

    if (uploaded.length > 0) onChange([...images, ...uploaded]);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const remove = (idx: number) => {
    const next = images
      .filter((_, i) => i !== idx)
      .map((img, i) => ({ ...img, orden: i, esPrincipal: i === 0 }));
    onChange(next);
  };

  const setPrincipal = (idx: number) => {
    onChange(images.map((img, i) => ({ ...img, esPrincipal: i === idx })));
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {/* Image thumbnails */}
        {images.map((img, idx) => (
          <div
            key={img.url}
            className="relative group aspect-square bg-[#1a1a1a] rounded overflow-hidden border border-gray-800"
          >
            <Image src={img.url} alt={`Imagen ${idx + 1}`} fill className="object-cover" />

            {img.esPrincipal && (
              <span className="absolute top-1 left-1 text-[9px] font-bold uppercase tracking-wider bg-[#38bdf8] text-black px-1.5 py-0.5 rounded-sm">
                Principal
              </span>
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              {!img.esPrincipal && (
                <button
                  type="button"
                  onClick={() => setPrincipal(idx)}
                  className="text-[10px] font-bold uppercase tracking-wider bg-[#38bdf8] text-black px-2 py-1 rounded-sm hover:bg-white transition-colors"
                >
                  Principal
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-1 rounded-sm hover:bg-red-500 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

        {/* Uploading placeholder */}
        {uploading && (
          <div className="aspect-square bg-[#1a1a1a] rounded border border-gray-800 flex items-center justify-center">
            <SpinnerIcon />
          </div>
        )}

        {/* Drop zone cell — same size as images */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`aspect-square rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
            dragOver
              ? "border-[#38bdf8] bg-[#38bdf8]/10"
              : "border-gray-700 hover:border-[#38bdf8] bg-[#0a0a0a] hover:bg-[#38bdf8]/5"
          }`}
        >
          <UploadIcon className={dragOver ? "text-[#38bdf8]" : "text-gray-600"} />
          <span className="text-[10px] text-gray-600 mt-1 text-center leading-tight px-1">
            {uploading ? "Subiendo..." : "Agregar"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/40 rounded px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin text-[#38bdf8]" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
