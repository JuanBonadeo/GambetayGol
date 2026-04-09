"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/types";

interface RelatedProductsProps {
  products: Product[];
  currentSlug: string;
  currentClubId: string;
  currentCategoria: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function RelatedProducts({
  products,
  currentSlug,
  currentClubId,
  currentCategoria,
}: RelatedProductsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const related = products
    .filter(
      (p) =>
        p.slug !== currentSlug &&
        p.activo &&
        (p.clubId === currentClubId || p.categoriaId === currentCategoria)
    )
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="bg-[#131313] py-16 px-6 border-t border-[#474747]/20">
      <div className="max-w-[1600px] mx-auto">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-white border-l-4 border-[#34b5fa] pl-4 mb-8">
          TAMBIÉN TE PUEDE GUSTAR
        </h2>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[6px]"
        >
          {related.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
