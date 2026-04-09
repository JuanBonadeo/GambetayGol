"use client";

import { motion } from "framer-motion";

interface ShinyTextProps {
  children: string;
  color: string;        // base text color e.g. "#ffffff" or "#34b5fa"
  duration?: number;    // seconds per sweep, default 4
  className?: string;
}

export default function ShinyText({
  children,
  color,
  duration = 4,
  className = "",
}: ShinyTextProps) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${color} 25%, rgba(255,255,255,0.95) 50%, ${color} 75%)`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: color, // fallback for browsers without background-clip: text
      }}
      animate={{ backgroundPosition: ["100% 0%", "-100% 0%"] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        repeatDelay: 1.5,
      }}
    >
      {children}
    </motion.span>
  );
}
