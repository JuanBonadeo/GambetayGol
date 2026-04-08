"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ProductImage, Offer } from "@/types";

interface ImageGalleryProps {
  images: ProductImage[];
  offer: Offer | null;
  productName: string;
}

export default function ImageGallery({ images, offer, productName }: ImageGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.esPrincipal) return -1;
    if (b.esPrincipal) return 1;
    return a.orden - b.orden;
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedImage = sorted[selectedIdx];

  const discountLabel =
    offer && offer.tipo === "PORCENTAJE"
      ? `${Math.round(offer.descuento)}% OFF`
      : offer
      ? "OFERTA"
      : null;

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-[#1b1b1b] flex items-center justify-center">
        <EmptyShirtIcon />
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square bg-[#1b1b1b] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={selectedImage.url}
              alt={`${productName} — imagen ${selectedIdx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={selectedIdx === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Badge */}
        {discountLabel && (
          <span className="absolute top-4 left-4 bg-[#34b5fa] text-[#001e2f] text-[10px] font-black uppercase tracking-widest px-3 py-1 z-10">
            {discountLabel}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIdx(idx)}
              className={`relative aspect-square bg-[#1b1b1b] overflow-hidden transition-all duration-200 ${
                idx === selectedIdx
                  ? "outline outline-2 outline-[#34b5fa]"
                  : "opacity-50 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={`Miniatura ${idx + 1}`}
                fill
                sizes="10vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyShirtIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#474747" strokeWidth="1.5" strokeLinecap="square">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.86l.58-3.57a2 2 0 00-1.34-2.23z" />
    </svg>
  );
}
