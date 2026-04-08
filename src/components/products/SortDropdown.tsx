"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type SortOption = "recientes" | "precio-asc" | "precio-desc" | "nombre";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recientes", label: "MÁS RECIENTES" },
  { value: "precio-asc", label: "PRECIO: MENOR A MAYOR" },
  { value: "precio-desc", label: "PRECIO: MAYOR A MENOR" },
  { value: "nombre", label: "NOMBRE A-Z" },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (v: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = OPTIONS.find((o) => o.value === value)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 bg-[#2a2a2a] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#c6c6c6] hover:text-white transition-colors duration-200 min-w-[200px] justify-between"
      >
        {selected.label}
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 bg-[#2a2a2a] border border-[#474747]/30 z-20 min-w-full"
          >
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider transition-colors duration-150 ${
                  opt.value === value
                    ? "text-[#34b5fa] bg-[#34b5fa]/10"
                    : "text-[#c6c6c6] hover:text-white hover:bg-[#353535]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
