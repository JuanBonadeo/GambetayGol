"use client";

import { ProductVariant, Talla } from "@/types";

const TALLA_ORDER: Talla[] = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

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
  const sortedVariants = [...variants].sort(
    (a, b) => TALLA_ORDER.indexOf(a.talla) - TALLA_ORDER.indexOf(b.talla)
  );

  const isAvailable = (v: ProductVariant) => v.stock > 0;

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
        {sortedVariants.map((variant) => {
          const available = isAvailable(variant);
          const selected = selectedSize === variant.id;
          return (
            <button
              key={variant.id}
              onClick={() => available && onSelect(variant.id)}
              disabled={!available}
              className={`w-14 h-12 flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                selected
                  ? "bg-[#34b5fa] text-[#001e2f]"
                  : available
                  ? "bg-[#2a2a2a] text-[#c6c6c6] hover:bg-[#353535] hover:text-white"
                  : "bg-[#1b1b1b] text-[#474747] line-through cursor-not-allowed opacity-40"
              }`}
            >
              {variant.talla}
            </button>
          );
        })}
      </div>
    </div>
  );
}
