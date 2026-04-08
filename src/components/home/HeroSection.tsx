"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Product, getPrimaryImage } from "@/types";

interface HeroSectionProps {
  products: Product[];
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function HeroSection({ products }: HeroSectionProps) {
  const heroImage = '/banner.jpeg'

  return (
    <section className="relative min-h-[870px] flex items-center overflow-hidden bg-[#131313]">
      {/* Background image */}
      {heroImage && (
        <>
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt="Hero background"
              className="object-cover opacity-40 grayscale"
              priority
              fill
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#131313]/95 via-[#131313]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313]/80 via-transparent to-transparent" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 px-6 max-w-[1600px] mx-auto w-full pt-28 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Label */}
          <motion.p
            variants={itemVariants}
            className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-6"
          >
            COLECCIÓN 2025 — CAMISETAS RETRO
          </motion.p>

          {/* H1 */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-6"
          >
            <span className="text-white block">GAMBETA</span>
            <span className="text-[#34b5fa] block">Y GOL</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={itemVariants}
            className="text-xs font-bold uppercase tracking-widest text-[#c6c6c6] max-w-sm mb-10"
          >
            La mística del fútbol retro.
            <br />
            La camiseta que lo cuenta todo.
          </motion.p>

          {/* CTA */}
          <motion.div variants={itemVariants}>
            <Link
              href="/productos"
              className="inline-block bg-white text-[#001e2c] font-black uppercase tracking-widest py-4 px-10 text-sm hover:bg-[#34b5fa] hover:text-[#001e2f] transition-colors duration-300"
            >
              VER COLECCIÓN
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
