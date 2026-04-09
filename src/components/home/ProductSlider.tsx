"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/types";

interface ProductSliderProps {
  title: string;
  products: Product[];
}

export default function ProductSlider({ title, products }: ProductSliderProps) {
  const constraintsRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  return (
    <section className="bg-[#1b1b1b] py-16 px-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.h2
            initial={{ opacity: 0, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-2xl font-black uppercase tracking-tighter text-white border-l-4 border-[#34b5fa] pl-4"
          >
            {title}
          </motion.h2>
          <Link
            href="/productos"
            className="text-xs font-black uppercase tracking-widest text-[#34b5fa] hover:text-white transition-colors duration-300"
          >
            VER TODO →
          </Link>
        </div>

        {/* Slider */}
        <div ref={constraintsRef} className="overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.1}
            className="flex gap-3 cursor-grab active:cursor-grabbing select-none"
            style={{ width: "max-content" }}
          >
            {products.map((product, i) => (
              <div
                key={product.id}
                className="flex-none w-[260px] sm:w-[300px] pointer-events-none"
                style={{ pointerEvents: "none" }}
              >
                <div style={{ pointerEvents: "all" }}>
                  <ProductCard product={product} priority={i < 3} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
