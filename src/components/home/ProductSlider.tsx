"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@/types";

interface ProductSliderProps {
  title: string;
  products: Product[];
}

const SPEED = 0.6; // px per frame

export default function ProductSlider({ title, products }: ProductSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const pausedRef = useRef(false);
  const startXRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const maxDragRef = useRef(0);

  useEffect(() => {
    const calc = () => {
      if (containerRef.current && trackRef.current) {
        const max = Math.max(0, trackRef.current.scrollWidth - containerRef.current.offsetWidth);
        maxDragRef.current = max;
      }
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [products]);

  // Auto-scroll loop
  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current && !isDraggingRef.current && trackRef.current && maxDragRef.current > 0) {
        currentOffsetRef.current += SPEED;
        if (currentOffsetRef.current >= maxDragRef.current) {
          currentOffsetRef.current = 0;
        }
        trackRef.current.style.transform = `translateX(${-currentOffsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    pausedRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !trackRef.current) return;
    const delta = e.clientX - startXRef.current;
    const newOffset = Math.max(0, Math.min(maxDragRef.current, currentOffsetRef.current - delta));
    trackRef.current.style.transform = `translateX(${-newOffset}px)`;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - startXRef.current;
    currentOffsetRef.current = Math.max(0, Math.min(maxDragRef.current, currentOffsetRef.current - delta));
    isDraggingRef.current = false;
    setIsDragging(false);
    // resume auto-scroll after a short pause
    setTimeout(() => { pausedRef.current = false; }, 2000);
  };

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
        <div
          ref={containerRef}
          className={`overflow-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <div
            ref={trackRef}
            className="flex gap-3 select-none"
            style={{ willChange: "transform" }}
          >
            {products.map((product, i) => (
              <div
                key={product.id}
                className="flex-none w-[260px] sm:w-[300px]"
                style={{ pointerEvents: isDragging ? "none" : "all" }}
              >
                <ProductCard product={product} priority={i < 3} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
