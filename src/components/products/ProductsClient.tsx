"use client";

import { useState, useMemo } from "react";
import { Product, Liga, Categoria, Club, Talla } from "@/types";
import FilterSidebar from "./FilterSidebar";
import FilterDrawer from "./FilterDrawer";
import SortDropdown, { SortOption } from "./SortDropdown";
import FilterChips from "./FilterChips";
import ProductGrid from "./ProductGrid";

const PAGE_SIZE = 24;

interface ProductsClientProps {
  products: Product[];
  ligas: Liga[];
  categorias: Categoria[];
  initialCategoriaId?: string | null;
  initialLigaId?: string | null;
  padTop?: boolean;
}

export default function ProductsClient({
  products,
  ligas,
  categorias,
  initialCategoriaId,
  initialLigaId,
  padTop = true,
}: ProductsClientProps) {
  const [selectedLigas, setSelectedLigas] = useState<string[]>(
    initialLigaId ? [initialLigaId] : []
  );
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(
    initialCategoriaId ? [initialCategoriaId] : []
  );
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedTallas, setSelectedTallas] = useState<Talla[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recientes");
  const [ligaSearch, setLigaSearch] = useState("");
  const [clubSearch, setClubSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Derive unique clubs from products
  const allClubs = useMemo<Club[]>(() => {
    const seen = new Set<string>();
    const clubs: Club[] = [];
    for (const p of products) {
      if (p.club && !seen.has(p.club.id)) {
        seen.add(p.club.id);
        clubs.push(p.club);
      }
    }
    return clubs.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.activo);

    if (selectedTallas.length > 0) {
      result = result.filter((p) =>
        p.variants.some((v) => selectedTallas.includes(v.talla as Talla))
      );
    }

    if (selectedLigas.length > 0) {
      result = result.filter((p) => selectedLigas.includes(p.club?.ligaId ?? ""));
    }
    if (selectedCategorias.length > 0) {
      result = result.filter((p) => selectedCategorias.includes(p.categoriaId));
    }
    if (selectedClubs.length > 0) {
      result = result.filter((p) => selectedClubs.includes(p.clubId));
    }

    switch (sortBy) {
      case "precio-asc":
        result = [...result].sort((a, b) => a.precio - b.precio);
        break;
      case "precio-desc":
        result = [...result].sort((a, b) => b.precio - a.precio);
        break;
      case "nombre":
        result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "recientes":
      default:
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [products, selectedLigas, selectedCategorias, selectedClubs, selectedTallas, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginated = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetPage = () => setCurrentPage(1);

  const toggleLiga = (id: string) => {
    setSelectedLigas((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
    // Clear club selection when changing liga
    setSelectedClubs([]);
    resetPage();
  };

  const toggleCategoria = (id: string) => {
    setSelectedCategorias((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    resetPage();
  };

  const toggleClub = (id: string) => {
    setSelectedClubs((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    resetPage();
  };

  const clearAll = () => {
    setSelectedLigas([]);
    setSelectedCategorias([]);
    setSelectedClubs([]);
    setSelectedTallas([]);
    setLigaSearch("");
    setClubSearch("");
    resetPage();
  };

  const totalActiveFilters =
    selectedLigas.length + selectedCategorias.length + selectedClubs.length + selectedTallas.length;

  const sharedFilterProps = {
    ligas,
    categorias,
    clubs: allClubs,
    selectedLigas,
    selectedCategorias,
    selectedClubs,
    selectedTallas,
    ligaSearch,
    clubSearch,
    onToggleLiga: toggleLiga,
    onToggleCategoria: toggleCategoria,
    onToggleClub: toggleClub,
    onToggleTalla: (t: Talla) => { setSelectedTallas((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]); resetPage(); },
    onLigaSearch: setLigaSearch,
    onClubSearch: setClubSearch,
    onClear: clearAll,
  };

  return (
    <>
      {/* Mobile filter drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        resultCount={filteredProducts.length}
        {...sharedFilterProps}
      />

    <div className={`flex flex-col md:flex-row gap-12 ${padTop ? "pt-10" : "pt-0"} pb-24 px-6 max-w-[1600px] mx-auto`}>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <FilterSidebar {...sharedFilterProps} />
      </div>

      <div className="flex-1 min-w-0">

        {/* Mobile: sticky filter bar */}
        <div className="md:hidden sticky top-[72px] z-30 bg-[#131313]/95 backdrop-blur-sm -mx-6 px-6 py-3 border-b border-[#474747]/20 mb-4 flex items-center gap-3">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-2 bg-[#2a2a2a] border border-[#474747]/40 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#c6c6c6] hover:text-white transition-colors flex-none"
          >
            <FilterIcon />
            FILTROS
            {totalActiveFilters > 0 && (
              <span className="bg-[#34b5fa] text-[#001e2f] text-[9px] font-black px-1.5 py-0.5 min-w-[18px] text-center">
                {totalActiveFilters}
              </span>
            )}
          </button>
          <div className="flex-1">
            <SortDropdown value={sortBy} onChange={(v) => { setSortBy(v); resetPage(); }} />
          </div>
        </div>

        {/* Desktop: results bar */}
        <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#474747]/20 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
            MOSTRANDO {filteredProducts.length} RESULTADO
            {filteredProducts.length !== 1 ? "S" : ""}
          </p>
          <SortDropdown value={sortBy} onChange={(v) => { setSortBy(v); resetPage(); }} />
        </div>

        <FilterChips
          selectedLigas={selectedLigas}
          selectedCategorias={selectedCategorias}
          selectedClubs={selectedClubs}
          selectedTallas={selectedTallas}
          ligas={ligas}
          categorias={categorias}
          clubs={allClubs}
          onRemoveLiga={toggleLiga}
          onRemoveCategoria={toggleCategoria}
          onRemoveClub={toggleClub}
          onRemoveTalla={(t) => { setSelectedTallas((prev) => prev.filter((x) => x !== t)); resetPage(); }}
        />

        <div className="mt-6">
          <ProductGrid products={paginated} />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <PaginationButton
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              ←
            </PaginationButton>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 flex items-center justify-center text-xs font-black uppercase tracking-wider transition-colors duration-200 ${
                  page === currentPage
                    ? "bg-[#34b5fa] text-[#001e2f]"
                    : "bg-[#2a2a2a] text-[#c6c6c6] hover:bg-[#353535] hover:text-white"
                }`}
              >
                {page}
              </button>
            ))}

            <PaginationButton
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              →
            </PaginationButton>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

function FilterIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function PaginationButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 flex items-center justify-center text-xs font-black bg-[#2a2a2a] text-[#c6c6c6] hover:bg-[#353535] hover:text-white transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
