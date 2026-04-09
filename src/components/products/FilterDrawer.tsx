"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Liga, Categoria, Club } from "@/types";

const CLUBS_DEFAULT_VISIBLE = 5;

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  ligas: Liga[];
  categorias: Categoria[];
  clubs: Club[];
  selectedLigas: string[];
  selectedCategorias: string[];
  selectedClubs: string[];
  ligaSearch: string;
  clubSearch: string;
  onToggleLiga: (id: string) => void;
  onToggleCategoria: (id: string) => void;
  onToggleClub: (id: string) => void;
  onLigaSearch: (q: string) => void;
  onClubSearch: (q: string) => void;
  onClear: () => void;
  resultCount: number;
}

export default function FilterDrawer({
  open,
  onClose,
  ligas,
  categorias,
  clubs,
  selectedLigas,
  selectedCategorias,
  selectedClubs,
  ligaSearch,
  clubSearch,
  onToggleLiga,
  onToggleCategoria,
  onToggleClub,
  onLigaSearch,
  onClubSearch,
  onClear,
  resultCount,
}: FilterDrawerProps) {
  const hasFilters =
    selectedLigas.length > 0 ||
    selectedCategorias.length > 0 ||
    selectedClubs.length > 0;

  const totalFilters =
    selectedLigas.length + selectedCategorias.length + selectedClubs.length;

  const filteredLigas = ligas.filter((l) =>
    l.nombre.toLowerCase().includes(ligaSearch.toLowerCase())
  );

  const ligaFilteredClubs =
    selectedLigas.length > 0
      ? clubs.filter((c) => selectedLigas.includes(c.ligaId))
      : clubs;

  const searchedClubs = ligaFilteredClubs.filter((c) =>
    c.nombre.toLowerCase().includes(clubSearch.toLowerCase())
  );

  const visibleClubs =
    selectedLigas.length > 0 || clubSearch.length > 0
      ? searchedClubs
      : searchedClubs.slice(0, CLUBS_DEFAULT_VISIBLE);

  const hasMoreClubs =
    selectedLigas.length === 0 &&
    clubSearch.length === 0 &&
    ligaFilteredClubs.length > CLUBS_DEFAULT_VISIBLE;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/70"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[61] bg-[#1b1b1b] flex flex-col max-h-[85vh] rounded-t-none"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-none">
              <div className="w-10 h-1 bg-[#474747]/60 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#474747]/20 flex-none">
              <div className="flex items-center gap-3">
                <h2 className="font-black uppercase text-xs tracking-widest text-white">
                  FILTROS
                </h2>
                {totalFilters > 0 && (
                  <span className="bg-[#34b5fa] text-[#001e2f] text-[9px] font-black px-2 py-0.5 min-w-[20px] text-center">
                    {totalFilters}
                  </span>
                )}
              </div>
              {hasFilters && (
                <button
                  onClick={onClear}
                  className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] hover:text-white transition-colors"
                >
                  LIMPIAR TODO
                </button>
              )}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">

              {/* Liga */}
              <Section title="LIGA">
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={ligaSearch}
                    onChange={(e) => onLigaSearch(e.target.value)}
                    placeholder="BUSCAR LIGA"
                    className="w-full bg-[#2a2a2a] text-[#e2e2e2] placeholder:text-[#474747] placeholder:text-[10px] placeholder:tracking-widest placeholder:uppercase px-3 py-2.5 text-xs outline-none border-b-2 border-transparent focus:border-[#34b5fa] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredLigas.map((liga) => {
                    const active = selectedLigas.includes(liga.id);
                    return (
                      <button
                        key={liga.id}
                        onClick={() => onToggleLiga(liga.id)}
                        className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors text-left border ${
                          active
                            ? "bg-[#34b5fa] border-[#34b5fa] text-[#001e2f]"
                            : "bg-[#2a2a2a] border-[#474747]/30 text-[#c6c6c6]"
                        }`}
                      >
                        {liga.nombre}
                      </button>
                    );
                  })}
                  {filteredLigas.length === 0 && (
                    <p className="text-[10px] text-[#474747] uppercase tracking-widest col-span-2 py-2">
                      Sin resultados
                    </p>
                  )}
                </div>
              </Section>

              {/* Club */}
              <Section title="CLUB">
                {selectedLigas.length === 0 && (
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={clubSearch}
                      onChange={(e) => onClubSearch(e.target.value)}
                      placeholder="BUSCAR CLUB"
                      className="w-full bg-[#2a2a2a] text-[#e2e2e2] placeholder:text-[#474747] placeholder:text-[10px] placeholder:tracking-widest placeholder:uppercase px-3 py-2.5 text-xs outline-none border-b-2 border-transparent focus:border-[#34b5fa] transition-colors"
                    />
                  </div>
                )}
                {selectedLigas.length > 0 && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#474747] mb-2">
                    CLUBES DE LA LIGA SELECCIONADA
                  </p>
                )}
                <div className="grid grid-cols-2 gap-1.5">
                  {visibleClubs.map((club) => {
                    const active = selectedClubs.includes(club.id);
                    return (
                      <button
                        key={club.id}
                        onClick={() => onToggleClub(club.id)}
                        className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors text-left border ${
                          active
                            ? "bg-[#34b5fa] border-[#34b5fa] text-[#001e2f]"
                            : "bg-[#2a2a2a] border-[#474747]/30 text-[#c6c6c6]"
                        }`}
                      >
                        {club.nombre}
                      </button>
                    );
                  })}
                  {hasMoreClubs && (
                    <p className="text-[10px] text-[#474747] uppercase tracking-widest col-span-2 py-2">
                      +{ligaFilteredClubs.length - CLUBS_DEFAULT_VISIBLE} más — buscá por nombre
                    </p>
                  )}
                  {visibleClubs.length === 0 && (
                    <p className="text-[10px] text-[#474747] uppercase tracking-widest col-span-2 py-2">
                      Sin resultados
                    </p>
                  )}
                </div>
              </Section>

              {/* Categoría */}
              <Section title="CATEGORÍA">
                <div className="grid grid-cols-2 gap-1.5">
                  {categorias.map((cat) => {
                    const active = selectedCategorias.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => onToggleCategoria(cat.id)}
                        className={`px-3 py-2.5 text-[10px] font-black uppercase tracking-wider transition-colors text-left border ${
                          active
                            ? "bg-[#34b5fa] border-[#34b5fa] text-[#001e2f]"
                            : "bg-[#2a2a2a] border-[#474747]/30 text-[#c6c6c6]"
                        }`}
                      >
                        {cat.nombre.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </Section>

            </div>

            {/* Footer CTA */}
            <div className="flex-none px-6 py-4 border-t border-[#474747]/20 bg-[#1b1b1b]">
              <button
                onClick={onClose}
                className="w-full py-4 bg-white text-[#001e2c] text-sm font-black uppercase tracking-widest hover:bg-[#34b5fa] hover:text-[#001e2f] transition-colors duration-200"
              >
                VER {resultCount} RESULTADO{resultCount !== 1 ? "S" : ""}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-black uppercase text-[10px] tracking-widest text-[#c6c6c6] mb-3 pb-2 border-b border-[#474747]/20">
        {title}
      </p>
      {children}
    </div>
  );
}
