"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Product, getPrimaryImage } from "@/types";

interface CategoriesGridProps {
  products: Product[];
}

const CATEGORIES: { slug: string; label: string; description: string }[] = [
  { slug: "retro", label: "RETRO", description: "Historia bordada en cada costura" },
  { slug: "fan", label: "FAN", description: "Para los que viven el juego" },
  { slug: "jugador", label: "JUGADOR", description: "La versión del campo" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function CategoriesGrid({ products }: CategoriesGridProps) {
  const getImageForCategory = (slug: string) => {
    const product = products.find((p) => p.categoria?.slug === slug);
    return product ? getPrimaryImage(product) : null;
  };

  return (
    <section className="bg-[#131313] py-16 px-6">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 h-auto md:h-[600px]"
        >
          {CATEGORIES.map((cat) => {
            const imgUrl = getImageForCategory(cat.slug);
            return (
              <motion.div
                key={cat.slug}
                variants={cardVariants}
                className="relative overflow-hidden group cursor-pointer bg-[#1b1b1b] h-[360px] md:h-full"
              >
                <Link
                  href={`/productos?categoria=${cat.slug}`}
                  className="block w-full h-full"
                >
                  {/* Image */}
                  {imgUrl && (
                    <Image
                      src={imgUrl}
                      alt={cat.label}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover grayscale-[60%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  )}

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-2">
                      {cat.description}
                    </p>
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-white group-hover:text-[#34b5fa] transition-colors duration-300">
                      {cat.label}
                    </h3>
                  </div>

                  {/* Hover border */}
                  <div className="absolute inset-0 border border-[#34b5fa]/0 group-hover:border-[#34b5fa]/30 transition-all duration-500 pointer-events-none" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
