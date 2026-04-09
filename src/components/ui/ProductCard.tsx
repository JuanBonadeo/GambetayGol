"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product, getDiscountedPrice, getPrimaryImage, formatPrice } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { finalPrice, originalPrice, discountPercent } = getDiscountedPrice(product);
  const imageUrl = getPrimaryImage(product);
  const isNew =
    discountPercent === null &&
    new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const badge = discountPercent
    ? `${Math.round(discountPercent)}% OFF`
    : isNew
    ? "NEW"
    : null;

  return (
    <motion.div
      className="group relative bg-[#1f1f1f] cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={`/productos/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#1b1b1b]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.nombre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover  group-hover:grayscale-0 transition-all duration-700"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 bg-[#2a2a2a] flex items-center justify-center">
              <ShirtIcon />
            </div>
          )}

          {/* Badge */}
          {badge && (
            <span
              className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                discountPercent
                  ? "bg-[#34b5fa] text-[#001e2f]"
                  : "bg-white text-[#001e2c]"
              }`}
            >
              {badge}
            </span>
          )}

          {/* Hover overlay accent */}
          <div className="absolute inset-0 border border-[#34b5fa]/0 group-hover:border-[#34b5fa]/40 transition-all duration-300 pointer-events-none" />
        </div>

        {/* Info */}
        <div className="p-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6] mb-1">
            {product.club.nombre}
          </p>
          <p className="text-sm font-black uppercase tracking-tighter text-[#e2e2e2] line-clamp-2 mb-2">
            {product.nombre}
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-black text-[#34b5fa]">
              {formatPrice(finalPrice)}
            </span>
            {discountPercent && (
              <span className="text-xs text-[#c6c6c6] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ShirtIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#474747"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.86l.58-3.57a2 2 0 00-1.34-2.23z" />
    </svg>
  );
}
