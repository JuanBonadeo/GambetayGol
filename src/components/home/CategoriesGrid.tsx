"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Product } from "@/types";
import TiltedCard from "@/components/bits/TiltedCard";

interface CategoriesGridProps {
  products: Product[];
}

const CATEGORIES: { key: string; label: string; description: string; url: string; href: string }[] = [
  {
    key: "retro",
    label: "RETRO",
    description: "Historia bordada en cada costura",
    url: "/retro.jpg",
    href: "/productos?categoria=retro",
  },
  {
    key: "premier",
    label: "PREMIER",
    description: "La élite del fútbol mundial",
    url: "/premier1.jpg",
    href: "/productos?liga=premier-league",
  },
  {
    key: "selecciones",
    label: "SELECCIONES",
    description: "El orgullo de cada nación",
    url: "/selecciones.jpg",
    href: "/productos?liga=selecciones",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function CategoriesGrid({ products: _ }: CategoriesGridProps) {
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
            return (
              // Fade-in wrapper — no overflow-hidden here (would flatten 3D)
              <motion.div
                key={cat.key}
                variants={cardVariants}
                className="h-[360px] md:h-full"
              >
                <TiltedCard
                  tiltMaxAngleDeg={8}
                  scaleOnHover={1.03}
                  glareEffect={true}
                  className="h-full w-full group cursor-pointer bg-[#1b1b1b]"
                >
                  <Link
                    href={cat.href}
                    className="block w-full h-full"
                  >
                    {/* Image */}
                    {cat.url && (
                      <Image
                        src={cat.url}
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
                </TiltedCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
