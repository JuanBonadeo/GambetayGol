"use client";

import { useRef, ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

interface ScrollVelocityProps {
  texts: string[];
  velocity?: number;
  className?: string;
}

function ParallaxText({
  children,
  baseVelocity = 50,
}: {
  children: ReactNode;
  baseVelocity?: number;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });
  const directionFactor = useRef<number>(1);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    const current = baseX.get() + moveBy;
    // Wrap at -50% since we render 4 copies (each is 25% of total width)
    if (current <= -50) baseX.set(current + 50);
    else if (current >= 0) baseX.set(current - 50);
    else baseX.set(current);
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <div className="overflow-hidden whitespace-nowrap flex">
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className="text-[10px] font-black uppercase tracking-widest text-[#474747] mx-8"
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ScrollVelocity({
  texts,
  velocity = 50,
  className = "",
}: ScrollVelocityProps) {
  return (
    <section
      className={`py-3 bg-[#0e0e0e] border-y border-[#474747]/20 overflow-hidden select-none ${className}`}
    >
      {texts.map((text, i) => (
        <ParallaxText key={i} baseVelocity={i % 2 === 0 ? velocity : -velocity}>
          {text} — {text} — {text} —{" "}
        </ParallaxText>
      ))}
    </section>
  );
}
