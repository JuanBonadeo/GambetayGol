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
  // Si no hay ninguna variante real, mostramos todas las tallas estándar como encargo
  const noVariants = variants.length === 0;

  const rows: { id: string; talla: Talla; available: boolean }[] = noVariants
    ? TALLA_ORDER.map((t) => ({ id: virtualId(t), talla: t, available: false }))
    : [...variants]
        .sort((a, b) => TALLA_ORDER.indexOf(a.talla) - TALLA_ORDER.indexOf(b.talla))
        .map((v) => ({ id: v.id, talla: v.talla, available: v.stock > 0 }));

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
    </div>
  );
}
