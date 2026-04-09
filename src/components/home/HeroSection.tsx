"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Product } from "@/types";
import ShinyText from "@/components/bits/ShinyText";
import Magnet from "@/components/bits/Magnet";

interface HeroSectionProps {
  products: Product[];
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

// Stadium light blobs — screen blend mode over grayscale image
const BLOBS = [
  {
    // Large cyan orb — upper right
    size: 700,
    color: "rgba(52, 181, 250, 0.55)",
    blur: 90,
    initial: { top: "-15%", right: "8%" },
    animate: {
      x: [0, 80, -40, 20, 0],
      y: [0, 60, -30, 40, 0],
      scale: [1, 1.15, 0.92, 1.08, 1],
    },
    duration: 16,
  },
  {
    // Medium blue-white orb — center right
    size: 500,
    color: "rgba(160, 220, 255, 0.4)",
    blur: 110,
    initial: { top: "30%", right: "20%" },
    animate: {
      x: [0, -60, 40, -20, 0],
      y: [0, -50, 30, -40, 0],
      scale: [1, 0.9, 1.2, 0.95, 1],
    },
    duration: 20,
  },
  {
    // Tight bright orb — bottom right corner
    size: 350,
    color: "rgba(52, 181, 250, 0.7)",
    blur: 60,
    initial: { bottom: "5%", right: "5%" },
    animate: {
      x: [0, -50, 30, 0],
      y: [0, -40, 20, 0],
      scale: [1, 1.25, 0.85, 1],
    },
    duration: 12,
  },
  {
    // Wide atmospheric glow — far right edge
    size: 900,
    color: "rgba(20, 100, 180, 0.3)",
    blur: 140,
    initial: { top: "10%", right: "-20%" },
    animate: {
      x: [0, 40, -20, 0],
      y: [0, 30, -15, 0],
      scale: [1, 1.1, 0.95, 1],
    },
    duration: 25,
  },
];

export default function HeroSection({ products: _ }: HeroSectionProps) {
  return (
    <section className="relative min-h-[870px] flex items-center overflow-hidden bg-[#131313]">

      {/* LAYER 1: Grayscale image — Ken Burns slow pan */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <motion.div
          className="absolute inset-[-6%]"
          animate={{ scale: [1, 1.05], x: ["0%", "1.5%"], y: ["0%", "-1%"] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        >
          <Image
            src="/banner.jpg"
            alt="Hero background"
            fill
            className="object-cover opacity-60 grayscale"
            priority
          />
        </motion.div>
      </div>

      {/* LAYER 2: Stadium light blobs — screen blend = colored light on dark image */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
        {BLOBS.map((blob, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: blob.size,
              height: blob.size,
              background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
              filter: `blur(${blob.blur}px)`,
              mixBlendMode: "screen",
              ...blob.initial,
            }}
            animate={blob.animate}
            transition={{
              duration: blob.duration,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        ))}
      </div>

      {/* LAYER 3: Gradient overlays — left dark for text, bottom fade */}
      <div className="absolute inset-0 z-[3] bg-gradient-to-r from-[#131313]/95 via-[#131313]/70 to-transparent" />
      <div className="absolute inset-0 z-[3] bg-gradient-to-t from-[#131313]/80 via-transparent to-transparent" />

      {/* LAYER 10: Content */}
      <div className="relative z-10 px-6 max-w-[1600px] mx-auto w-full pt-28 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          <motion.p
            variants={itemVariants}
            className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-6"
          >
            COLECCIÓN 2025 — CAMISETAS RETRO
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-6"
          >
            <ShinyText color="#ffffff" duration={5} className="block">
              GAMBETA
            </ShinyText>
            <ShinyText color="#34b5fa" duration={5} className="block">
              Y GOL
            </ShinyText>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xs font-bold uppercase tracking-widest text-[#c6c6c6] max-w-sm mb-10"
          >
            La mística del fútbol retro.
            <br />
            La camiseta que lo cuenta todo.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Magnet strength={0.25}>
              <Link
                href="/productos"
                className="inline-block bg-white text-[#001e2c] font-black uppercase tracking-widest py-4 px-10 text-sm hover:bg-[#34b5fa] hover:text-[#001e2f] transition-colors duration-300"
              >
                VER COLECCIÓN
              </Link>
            </Magnet>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
