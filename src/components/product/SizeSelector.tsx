"use client";

import { ProductVariant, Talla } from "@/types";

const TALLA_ORDER: Talla[] = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

// ID virtual para talles sin variante real en BD
export function virtualId(talla: Talla) {
  return `virtual_${talla}`;
}
export function isVirtualId(id: string) {
  return id.startsWith("virtual_");
}
export function tallaFromVirtualId(id: string): Talla {
  return id.replace("virtual_", "") as Talla;
}

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedSize: string | null;
  onSelect: (variantId: string) => void;
}

export default function SizeSelector({
  variants,
  selectedSize,
  onSelect,
}: SizeSelectorProps) {
  // Siempre mostrar todos los talles estándar.
  // Si hay variante con stock → disponible. Si hay variante sin stock o no hay variante → encargo.
  const rows: { id: string; talla: Talla; available: boolean }[] = TALLA_ORDER.map((talla) => {
    const variant = variants.find((v) => v.talla === talla);
    return variant
      ? { id: variant.id, talla, available: variant.stock > 0 }
      : { id: virtualId(talla), talla, available: false };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white">
          TALLA
        </p>
        <button className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] hover:text-white transition-colors duration-200">
          GUÍA DE TALLES →
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {rows.map(({ id, talla, available }) => {
          const selected = selectedSize === id;
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <button
                onClick={() => onSelect(id)}
                className={`w-14 h-12 flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  selected && available
                    ? "bg-[#34b5fa] text-[#001e2f]"
                    : selected && !available
                    ? "bg-[#2a2a2a] text-white border border-[#34b5fa]/40"
                    : available
                    ? "bg-[#2a2a2a] text-[#c6c6c6] hover:bg-[#353535] hover:text-white"
                    : "bg-[#1b1b1b] text-[#474747] border border-[#474747]/20 hover:border-[#474747]/50 hover:text-[#c6c6c6]"
                }`}
              >
                {talla}
              </button>
              {!available && (
                <span className="text-[8px] font-black uppercase tracking-widest text-[#474747]">
                  ENCARGO
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Aviso cuando el talle seleccionado es por encargo */}
      {selectedSize && rows.find((r) => r.id === selectedSize && !r.available) && (
        <div className="mt-3 flex items-start gap-2 bg-[#34b5fa]/5 border border-[#34b5fa]/20 px-3 py-2.5">
          <svg
            className="flex-none text-[#34b5fa] mt-0.5"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] leading-snug">
            ESTE TALLE ES POR ENCARGO — LO PEDIMOS ESPECIALMENTE PARA VOS. TE CONTACTAMOS PARA CONFIRMAR DISPONIBILIDAD Y PLAZO DE ENTREGA.
          </p>
        </div>
      )}
    </div>
  );
}
