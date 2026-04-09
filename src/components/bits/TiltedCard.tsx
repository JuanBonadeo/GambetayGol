"use client";

import { useRef, ReactNode } from "react";
import { motion, useSpring, useTransform, MotionValue } from "framer-motion";

interface TiltedCardProps {
  children: ReactNode;
  tiltMaxAngleDeg?: number;
  scaleOnHover?: number;
  glareEffect?: boolean;
  className?: string;
}

function GlareOverlay({
  glareX,
  glareY,
  glareOpacity,
}: {
  glareX: MotionValue<number>;
  glareY: MotionValue<number>;
  glareOpacity: MotionValue<number>;
}) {
  const background = useTransform(
    [glareX, glareY] as MotionValue[],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.18) 0%, transparent 60%)`
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ background, opacity: glareOpacity }}
    />
  );
}

export default function TiltedCard({
  children,
  tiltMaxAngleDeg = 8,
  scaleOnHover = 1.03,
  glareEffect = true,
  className = "",
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useSpring(0, { stiffness: 300, damping: 30, mass: 0.5 });
  const rawY = useSpring(0, { stiffness: 300, damping: 30, mass: 0.5 });
  const glareX = useSpring(50, { stiffness: 300, damping: 30 });
  const glareY = useSpring(50, { stiffness: 300, damping: 30 });
  const glareOpacity = useSpring(0, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(rawY, [-1, 1], [tiltMaxAngleDeg, -tiltMaxAngleDeg]);
  const rotateY = useTransform(rawX, [-1, 1], [-tiltMaxAngleDeg, tiltMaxAngleDeg]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rawX.set(x * 2 - 1);
    rawY.set(y * 2 - 1);
    glareX.set(x * 100);
    glareY.set(y * 100);
    glareOpacity.set(0.15);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    glareX.set(50);
    glareY.set(50);
    glareOpacity.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: scaleOnHover }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        {/* overflow-hidden on inner div so Next.js Image fill works with 3D parent */}
        <div className="relative w-full h-full overflow-hidden">
          {children}
        </div>

        {glareEffect && (
          <GlareOverlay
            glareX={glareX}
            glareY={glareY}
            glareOpacity={glareOpacity}
          />
        )}
      </motion.div>
    </div>
  );
}
