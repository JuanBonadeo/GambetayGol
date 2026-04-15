"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Liga, Categoria, Club } from "@/types";

const CLUBS_DEFAULT_VISIBLE = 5;

const TALLAS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
type Talla = typeof TALLAS[number];

interface FilterSidebarProps {
  ligas: Liga[];
  categorias: Categoria[];
  clubs: Club[];
  selectedLigas: string[];
  selectedCategorias: string[];
  selectedClubs: string[];
  selectedTallas: Talla[];
  ligaSearch: string;
  clubSearch: string;
  onToggleLiga: (id: string) => void;
  onToggleCategoria: (id: string) => void;
  onToggleClub: (id: string) => void;
  onToggleTalla: (t: Talla) => void;
  onLigaSearch: (q: string) => void;
  onClubSearch: (q: string) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  ligas,
  categorias,
  clubs,
  selectedLigas,
  selectedCategorias,
  selectedClubs,
  selectedTallas,
  ligaSearch,
  clubSearch,
  onToggleLiga,
  onToggleCategoria,
  onToggleClub,
  onToggleTalla,
  onLigaSearch,
  onClubSearch,
  onClear,
}: FilterSidebarProps) {
  const [ligaOpen, setLigaOpen] = useState(true);
  const [clubOpen, setClubOpen] = useState(true);
  const [catOpen, setCatOpen] = useState(true);

  const hasFilters =
    selectedLigas.length > 0 ||
    selectedCategorias.length > 0 ||
    selectedClubs.length > 0;

  const filteredLigas = ligas.filter((l) =>
    l.nombre.toLowerCase().includes(ligaSearch.toLowerCase())
  );

  // Clubs to show depends on whether a liga is selected
  const ligaFilteredClubs =
    selectedLigas.length > 0
      ? clubs.filter((c) => selectedLigas.includes(c.ligaId))
      : clubs;

  const searchedClubs = ligaFilteredClubs.filter((c) =>
    c.nombre.toLowerCase().includes(clubSearch.toLowerCase())
  );

  // When no liga selected, only show first N unless searching
  const visibleClubs =
    selectedLigas.length > 0 || clubSearch.length > 0
      ? searchedClubs
      : searchedClubs.slice(0, CLUBS_DEFAULT_VISIBLE);

  const hasMoreClubs =
    selectedLigas.length === 0 &&
    clubSearch.length === 0 &&
    ligaFilteredClubs.length > CLUBS_DEFAULT_VISIBLE;

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

      {/* Tallas section */}
      <div className="mb-6">
        <p className="font-black uppercase text-[10px] tracking-widest text-[#c6c6c6] mb-3">
          TALLE
        </p>
        <div className="flex flex-wrap gap-2">
          {TALLAS.map((talla) => {
            const active = selectedTallas.includes(talla);
            return (
              <button
                key={talla}
                onClick={() => onToggleTalla(talla)}
                className={`w-14 h-10 flex items-center justify-center text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? "bg-[#34b5fa] text-[#001e2f]"
                    : "bg-[#2a2a2a] text-[#c6c6c6] hover:bg-[#353535] hover:text-white"
                }`}
              >
                {talla}
              </button>
            );
          })}
        </div>
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

      {/* Club section */}
      <div className="mb-6">
        <button
          onClick={() => setClubOpen((v) => !v)}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="font-black uppercase text-[10px] tracking-widest text-[#c6c6c6]">
            CLUB
          </span>
          <ChevronIcon open={clubOpen} />
        </button>

        <AnimatePresence initial={false}>
          {clubOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Search — siempre visible cuando no hay liga seleccionada */}
              {selectedLigas.length === 0 && (
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={clubSearch}
                    onChange={(e) => onClubSearch(e.target.value)}
                    placeholder="BUSCAR CLUB"
                    className="w-full bg-[#353535] text-[#e2e2e2] placeholder:text-[#919191] placeholder:text-[10px] placeholder:tracking-widest placeholder:uppercase px-3 py-2 text-xs outline-none border-b-2 border-transparent focus:border-[#34b5fa] transition-colors duration-200"
                  />
                  <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191]" />
                </div>
              )}

              {selectedLigas.length > 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-[#474747] px-1 mb-2">
                  CLUBES DE LA LIGA SELECCIONADA
                </p>
              )}

              <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-hide">
                {visibleClubs.map((club) => {
                  const active = selectedClubs.includes(club.id);
                  return (
                    <button
                      key={club.id}
                      onClick={() => onToggleClub(club.id)}
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
                      {club.nombre}
                    </button>
                  );
                })}

                {hasMoreClubs && (
                  <p className="text-[10px] text-[#474747] px-3 py-2 uppercase tracking-widest">
                    +{ligaFilteredClubs.length - CLUBS_DEFAULT_VISIBLE} más — buscá por nombre
                  </p>
                )}

                {visibleClubs.length === 0 && (
                  <p className="text-[10px] text-[#919191] px-3 py-2 uppercase tracking-widest">
                    Sin resultados
                  </p>
                )}
              </div>
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
