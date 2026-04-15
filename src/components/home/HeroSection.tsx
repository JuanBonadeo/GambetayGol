"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Product } from "@/types";
import ShinyText from "@/components/bits/ShinyText";
import Magnet from "@/components/bits/Magnet";

interface HeroSectionProps {
  products: Product[];
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola!%20Quiero%20encargar%20una%20camiseta.`;
const AUTOPLAY_INTERVAL = 6000;

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const slideVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

const slideVariantsDesktop: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }),
};

// Stadium light blobs — screen blend mode over grayscale image
const BLOBS = [
  {
    size: 700,
    color: "rgba(52, 181, 250, 0.55)",
    blur: 90,
    initial: { top: "-15%", right: "8%" },
    animate: { x: [0, 80, -40, 20, 0], y: [0, 60, -30, 40, 0], scale: [1, 1.15, 0.92, 1.08, 1] },
    duration: 16,
  },
  {
    size: 500,
    color: "rgba(160, 220, 255, 0.4)",
    blur: 110,
    initial: { top: "30%", right: "20%" },
    animate: { x: [0, -60, 40, -20, 0], y: [0, -50, 30, -40, 0], scale: [1, 0.9, 1.2, 0.95, 1] },
    duration: 20,
  },
  {
    size: 350,
    color: "rgba(52, 181, 250, 0.7)",
    blur: 60,
    initial: { bottom: "5%", right: "5%" },
    animate: { x: [0, -50, 30, 0], y: [0, -40, 20, 0], scale: [1, 1.25, 0.85, 1] },
    duration: 12,
  },
  {
    size: 900,
    color: "rgba(20, 100, 180, 0.3)",
    blur: 140,
    initial: { top: "10%", right: "-20%" },
    animate: { x: [0, 40, -20, 0], y: [0, 30, -15, 0], scale: [1, 1.1, 0.95, 1] },
    duration: 25,
  },
];

function SlideMain({ isDesktop }: { isDesktop: boolean }) {
  return (
    <motion.div
      key="slide-main"
      custom={1}
      variants={isDesktop ? slideVariantsDesktop : slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="max-w-3xl"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.p variants={itemVariants} className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-4 sm:mb-6">
          COLECCIÓN SCALONETA — SELECCIÓN ARGENTINA
        </motion.p>

        <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-5 sm:mb-6">
          <ShinyText color="#ffffff" duration={5} className="block">GAMBETA</ShinyText>
          <ShinyText color="#34b5fa" duration={5} className="block">Y GOL</ShinyText>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xs font-bold uppercase tracking-widest text-[#c6c6c6] max-w-sm mb-7 sm:mb-10">
          Las camisetas de los campeones del mundo.
          <br />
          Vestite con la Scaloneta.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Magnet strength={0.25}>
            <Link
              href="/productos?liga=selecciones"
              className="inline-block bg-white text-[#001e2c] font-black uppercase tracking-widest py-4 px-10 text-sm hover:bg-[#34b5fa] hover:text-[#001e2f] transition-colors duration-300"
            >
              VER COLECCION
            </Link>
          </Magnet>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function SlideEncargo({ isDesktop }: { isDesktop: boolean }) {
  return (
    <motion.div
      key="slide-encargo"
      custom={-1}
      variants={isDesktop ? slideVariantsDesktop : slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="max-w-3xl"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.p variants={itemVariants} className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-4 sm:mb-6">
          PEDIDOS ESPECIALES
        </motion.p>

        <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-5 sm:mb-6">
          <ShinyText color="#ffffff" duration={5} className="block">TRABAJAMOS</ShinyText>
          <ShinyText color="#34b5fa" duration={5} className="block">POR ENCARGO</ShinyText>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xs font-bold uppercase tracking-widest text-[#c6c6c6] max-w-sm mb-7 sm:mb-10">
          Encargá la camiseta que vos querés
          <br />
          y en un mes la tenés en tu casa.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
          <Magnet strength={0.25}>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] text-white font-black uppercase tracking-widest py-4 px-8 text-sm hover:bg-[#1db954] transition-colors duration-300"
            >
              <WhatsAppIcon />
              ENCARGAR POR WSP
            </a>
          </Magnet>
          <Magnet strength={0.25}>
            <Link
              href="/productos"
              className="inline-block bg-transparent border border-white/40 text-white font-black uppercase tracking-widest py-4 px-8 text-sm hover:bg-white hover:text-[#001e2c] transition-colors duration-300"
            >
              VER DISPONIBLES
            </Link>
          </Magnet>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.848L.057 23.535a.75.75 0 00.908.908l5.69-1.471A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 01-4.964-1.362l-.355-.212-3.681.951.974-3.567-.232-.367A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  );
}

export default function HeroSection({ products: _ }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % 2);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative min-h-[600px] sm:min-h-[870px] flex items-center overflow-hidden bg-[#131313]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* LAYER 1: Grayscale image */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <motion.div
          className="absolute inset-[-6%]"
          animate={isDesktop
            ? { scale: [1, 1.05], x: ["0%", "1.5%"], y: ["0%", "-1%"] }
            : { scale: [1, 1.04, 1] }
          }
          transition={isDesktop
            ? { duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
            : { duration: 18, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }
          }
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

      {/* LAYER 2: Blobs — completos en desktop, uno liviano en mobile */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
        {/* Mobile: gradiente celeste estático — sin blur ni blendMode */}
        {!isDesktop && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 80% 30%, rgba(52,181,250,0.28) 0%, transparent 70%)",
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
          />
        )}
        {/* Desktop: todos los blobs originales */}
        {isDesktop && BLOBS.map((blob, i) => (
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
            transition={{ duration: blob.duration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
          />
        ))}
      </div>

      {/* LAYER 3: Gradient overlays */}
      {/* Mobile: oscurecer todo. Desktop: degradado lateral */}
      <div className="absolute inset-0 z-[3] bg-[#131313]/70 sm:bg-transparent sm:bg-gradient-to-r sm:from-[#131313]/95 sm:via-[#131313]/70 sm:to-transparent" />
      <div className="absolute inset-0 z-[3] bg-gradient-to-t from-[#131313]/80 via-transparent to-transparent" />

      {/* LAYER 10: Slide content */}
      <div className="relative z-10 px-6 max-w-[1600px] mx-auto w-full pt-24 pb-20 sm:pt-28 sm:pb-24">
        <AnimatePresence mode="wait">
          {current === 0 ? <SlideMain key="main" isDesktop={isDesktop} /> : <SlideEncargo key="encargo" isDesktop={isDesktop} />}
        </AnimatePresence>
      </div>

      {/* Dot navigation */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full ${
              current === i
                ? "w-8 h-2 bg-[#34b5fa]"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
