"use client";

import { useState, useEffect, ElementType, ReactNode } from "react";

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  dataText?: string;
}

const GLITCH_CSS = `
@keyframes glitch-clip-1 {
  0%   { clip-path: inset(40% 0 61% 0); transform: translate(-2px, 0); }
  20%  { clip-path: inset(92% 0 1%  0); transform: translate(2px,  0); }
  40%  { clip-path: inset(43% 0 1%  0); transform: translate(-1px, 0); }
  60%  { clip-path: inset(25% 0 58% 0); transform: translate(2px,  0); }
  80%  { clip-path: inset(54% 0 7%  0); transform: translate(-2px, 0); }
  100% { clip-path: inset(58% 0 43% 0); transform: translate(1px,  0); }
}
@keyframes glitch-clip-2 {
  0%   { clip-path: inset(24% 0 29% 0); transform: translate(2px,  0); }
  20%  { clip-path: inset(54% 0 7%  0); transform: translate(-2px, 0); }
  40%  { clip-path: inset(72% 0 11% 0); transform: translate(1px,  0); }
  60%  { clip-path: inset(10% 0 60% 0); transform: translate(-2px, 0); }
  80%  { clip-path: inset(38% 0 31% 0); transform: translate(2px,  0); }
  100% { clip-path: inset(82% 0 3%  0); transform: translate(-1px, 0); }
}
.glitch-active::before {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: #34b5fa;
  animation: glitch-clip-1 0.4s steps(1) infinite;
  pointer-events: none;
}
.glitch-active::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: #ff4444;
  animation: glitch-clip-2 0.4s steps(1) infinite;
  pointer-events: none;
}
`;

export default function GlitchText({
  children,
  className = "",
  as: Tag = "span",
  dataText,
}: GlitchTextProps) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (document.getElementById("glitch-keyframes")) return;
    const style = document.createElement("style");
    style.id = "glitch-keyframes";
    style.textContent = GLITCH_CSS;
    document.head.appendChild(style);
  }, []);

  const text = dataText ?? (typeof children === "string" ? children : undefined);

  return (
    // @ts-expect-error — dynamic tag
    <Tag
      className={`relative inline-block ${hovered ? "glitch-active" : ""} ${className}`}
      data-text={text}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Tag>
  );
}
