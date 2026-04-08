"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Categoria, Liga } from "@/types";

interface FilterChipsProps {
  selectedLigas: string[];
  selectedCategorias: Categoria[];
  ligas: Liga[];
  onRemoveLiga: (id: string) => void;
  onRemoveCategoria: (cat: Categoria) => void;
}

export default function FilterChips({
  selectedLigas,
  selectedCategorias,
  ligas,
  onRemoveLiga,
  onRemoveCategoria,
}: FilterChipsProps) {
  const hasAny = selectedLigas.length > 0 || selectedCategorias.length > 0;
  if (!hasAny) return null;

  const getLigaNombre = (id: string) => ligas.find((l) => l.id === id)?.nombre ?? id;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <AnimatePresence>
        {selectedLigas.map((id) => (
          <motion.button
            key={`liga-${id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onRemoveLiga(id)}
            className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#c6c6c6] hover:bg-[#353535] hover:text-white transition-colors duration-200"
          >
            {getLigaNombre(id)}
            <span className="text-[#34b5fa]">×</span>
          </motion.button>
        ))}

        {selectedCategorias.map((cat) => (
          <motion.button
            key={`cat-${cat}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onRemoveCategoria(cat)}
            className="flex items-center gap-2 bg-[#34b5fa]/20 border border-[#34b5fa]/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#34b5fa] hover:bg-[#34b5fa]/30 transition-colors duration-200"
          >
            {cat}
            <span>×</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
