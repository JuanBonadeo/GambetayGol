"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Liga, Categoria } from "@/types";

interface FilterSidebarProps {
  ligas: Liga[];
  categorias: Categoria[];
  selectedLigas: string[];
  selectedCategorias: string[];
  ligaSearch: string;
  onToggleLiga: (id: string) => void;
  onToggleCategoria: (id: string) => void;
  onLigaSearch: (q: string) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  ligas,
  categorias,
  selectedLigas,
  selectedCategorias,
  ligaSearch,
  onToggleLiga,
  onToggleCategoria,
  onLigaSearch,
  onClear,
}: FilterSidebarProps) {
  const [ligaOpen, setLigaOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(true);

  const hasFilters = selectedLigas.length > 0 || selectedCategorias.length > 0;

  const filteredLigas = ligas.filter((l) =>
    l.nombre.toLowerCase().includes(ligaSearch.toLowerCase())
  );

  return (
    <aside className="w-full md:w-64 flex-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#474747]/20">
        <h2 className="font-black uppercase text-xs tracking-widest text-white">
          FILTROS
        </h2>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] hover:text-white transition-colors duration-200"
          >
            LIMPIAR
          </button>
        )}
      </div>

      {/* Liga section */}
      <div className="mb-6">
        <button
          onClick={() => setLigaOpen((v) => !v)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-black uppercase text-[10px] tracking-widest text-[#c6c6c6]">
            LIGA
          </span>
          <ChevronIcon open={ligaOpen} />
        </button>

        <AnimatePresence initial={false}>
          {ligaOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  value={ligaSearch}
                  onChange={(e) => onLigaSearch(e.target.value)}
                  placeholder="BUSCAR LIGA"
                  className="w-full bg-[#353535] text-[#e2e2e2] placeholder:text-[#919191] placeholder:text-[10px] placeholder:tracking-widest placeholder:uppercase px-3 py-2 text-xs outline-none border-b-2 border-transparent focus:border-[#34b5fa] transition-colors duration-200"
                />
                <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191]" />
              </div>

              {/* Lista */}
              <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-hide">
                {filteredLigas.map((liga) => {
                  const active = selectedLigas.includes(liga.id);
                  return (
                    <button
                      key={liga.id}
                      onClick={() => onToggleLiga(liga.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors duration-200 text-left ${
                        active
                          ? "bg-[#34b5fa] text-[#001e2f]"
                          : "bg-[#2a2a2a] text-[#c6c6c6] hover:bg-[#353535] hover:text-white"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 flex-none border ${
                          active ? "bg-[#001e2f] border-[#001e2f]" : "border-[#919191]"
                        }`}
                      />
                      {liga.nombre}
                    </button>
                  );
                })}
                {filteredLigas.length === 0 && (
                  <p className="text-[10px] text-[#919191] px-3 py-2 uppercase tracking-widest">
                    Sin resultados
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Categoria section */}
      <div className="mb-6">
        <button
          onClick={() => setCatOpen((v) => !v)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-black uppercase text-[10px] tracking-widest text-[#c6c6c6]">
            CATEGORÍA
          </span>
          <ChevronIcon open={catOpen} />
        </button>

        <AnimatePresence initial={false}>
          {catOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden space-y-1"
            >
              {categorias.map((cat) => {
                const active = selectedCategorias.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => onToggleCategoria(cat.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-colors duration-200 text-left ${
                      active
                        ? "bg-[#34b5fa] text-[#001e2f]"
                        : "bg-[#2a2a2a] text-[#c6c6c6] hover:bg-[#353535] hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 flex-none border ${
                        active ? "bg-[#001e2f] border-[#001e2f]" : "border-[#919191]"
                      }`}
                    />
                    {cat.nombre.toUpperCase()}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#919191"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      className={className}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
