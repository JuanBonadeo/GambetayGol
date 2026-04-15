"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Categoria, Liga, Club, Talla } from "@/types";

interface FilterChipsProps {
  selectedLigas: string[];
  selectedCategorias: string[];
  selectedClubs: string[];
  selectedTallas: Talla[];
  ligas: Liga[];
  categorias: Categoria[];
  clubs: Club[];
  onRemoveLiga: (id: string) => void;
  onRemoveCategoria: (id: string) => void;
  onRemoveClub: (id: string) => void;
  onRemoveTalla: (t: Talla) => void;
}

export default function FilterChips({
  selectedLigas,
  selectedCategorias,
  selectedClubs,
  selectedTallas,
  ligas,
  categorias,
  clubs,
  onRemoveLiga,
  onRemoveCategoria,
  onRemoveClub,
  onRemoveTalla,
}: FilterChipsProps) {
  const hasAny =
    selectedLigas.length > 0 ||
    selectedCategorias.length > 0 ||
    selectedClubs.length > 0 ||
    selectedTallas.length > 0;

  if (!hasAny) return null;

  const getLigaNombre = (id: string) => ligas.find((l) => l.id === id)?.nombre ?? id;
  const getCategoriaNombre = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id;
  const getClubNombre = (id: string) => clubs.find((c) => c.id === id)?.nombre ?? id;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <AnimatePresence>
        {selectedTallas.map((talla) => (
          <motion.button
            key={`talla-${talla}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onRemoveTalla(talla)}
            className="flex items-center gap-2 bg-[#34b5fa] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#001e2f] hover:bg-[#7dd3fc] transition-colors duration-200"
          >
            {talla}
            <span>×</span>
          </motion.button>
        ))}

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

        {selectedClubs.map((id) => (
          <motion.button
            key={`club-${id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onRemoveClub(id)}
            className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#c6c6c6] hover:bg-[#353535] hover:text-white transition-colors duration-200"
          >
            {getClubNombre(id)}
            <span className="text-[#34b5fa]">×</span>
          </motion.button>
        ))}

        {selectedCategorias.map((id) => (
          <motion.button
            key={`cat-${id}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onRemoveCategoria(id)}
            className="flex items-center gap-2 bg-[#34b5fa]/20 border border-[#34b5fa]/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#34b5fa] hover:bg-[#34b5fa]/30 transition-colors duration-200"
          >
            {getCategoriaNombre(id)}
            <span>×</span>
          </motion.button>
        ))}

      </AnimatePresence>
    </div>
  );
}
