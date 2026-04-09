"use client";

import { useEffect, useRef } from "react";

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  className?: string;
}

function smoothNoise(x: number, y: number, t: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = Math.sin(X * 127.1 + Y * 311.7 + t * 74.7) * 43758.5453123;
  const b = Math.sin((X + 1) * 127.1 + Y * 311.7 + t * 74.7) * 43758.5453123;
  const c = Math.sin(X * 127.1 + (Y + 1) * 311.7 + t * 74.7) * 43758.5453123;
  const d = Math.sin((X + 1) * 127.1 + (Y + 1) * 311.7 + t * 74.7) * 43758.5453123;
  return (
    (a - Math.floor(a)) * (1 - u) * (1 - v) +
    (b - Math.floor(b)) * u * (1 - v) +
    (c - Math.floor(c)) * (1 - u) * v +
    (d - Math.floor(d)) * u * v
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [52, 181, 250];
}

export default function Silk({
  speed = 5,
  scale = 1,
  color = "#34b5fa",
  noiseIntensity = 1.5,
  rotation = 0,
  className = "",
}: SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const [r, g, b] = hexToRgb(color);
    let t = 0;
    const RES = 0.33; // render at 33% resolution for performance

    const resize = () => {
      canvas.width = Math.floor(canvas.offsetWidth * RES);
      canvas.height = Math.floor(canvas.offsetHeight * RES);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      t += 0.001 * speed;

      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const nx = (x / W) * scale + rotation;
          const ny = (y / H) * scale;

          const n1 = smoothNoise(nx * 3, ny * 3, t);
          const n2 = smoothNoise(nx * 6 + 1.5, ny * 6 + 1.5, t * 1.3);
          const n = (n1 * 0.7 + n2 * 0.3) * noiseIntensity;

          const shine = Math.pow(Math.abs(Math.sin(n * Math.PI * 2 + t * 2)), 2.5);

          const pr = Math.min(255, r * (0.05 + n * 0.15) + shine * 80);
          const pg = Math.min(255, g * (0.05 + n * 0.15) + shine * 60);
          const pb = Math.min(255, b * (0.05 + n * 0.25) + shine * 120);

          const idx = (y * W + x) * 4;
          data[idx] = pr;
          data[idx + 1] = pg;
          data[idx + 2] = pb;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      suppressHydrationWarning
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ display: "block", imageRendering: "auto" }}
    />
  );
}
