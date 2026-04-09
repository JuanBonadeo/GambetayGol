"use client";

import { useState, useMemo } from "react";
import { Product, Liga, Categoria } from "@/types";
import FilterSidebar from "./FilterSidebar";
import SortDropdown, { SortOption } from "./SortDropdown";
import FilterChips from "./FilterChips";
import ProductGrid from "./ProductGrid";

const PAGE_SIZE = 24;

interface ProductsClientProps {
  products: Product[];
  ligas: Liga[];
  categorias: Categoria[];
  initialCategoriaId?: string | null;
  padTop?: boolean;
}

export default function ProductsClient({
  products,
  ligas,
  categorias,
  initialCategoriaId,
  padTop = true,
}: ProductsClientProps) {
  const [selectedLigas, setSelectedLigas] = useState<string[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(
    initialCategoriaId ? [initialCategoriaId] : []
  );
  const [sortBy, setSortBy] = useState<SortOption>("recientes");
  const [ligaSearch, setLigaSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.activo);

    if (selectedLigas.length > 0) {
      result = result.filter((p) => selectedLigas.includes(p.club?.ligaId ?? ""));
    }
    if (selectedCategorias.length > 0) {
      result = result.filter((p) => selectedCategorias.includes(p.categoriaId));
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
  }, [products, selectedLigas, selectedCategorias, sortBy]);

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
    resetPage();
  };

  const toggleCategoria = (id: string) => {
    setSelectedCategorias((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    resetPage();
  };

  const clearAll = () => {
    setSelectedLigas([]);
    setSelectedCategorias([]);
    setLigaSearch("");
    resetPage();
  };

  return (
    <div className={`flex flex-col md:flex-row gap-12 ${padTop ? "pt-36" : "pt-0"} pb-24 px-6 max-w-[1600px] mx-auto`}>
      <FilterSidebar
        ligas={ligas}
        categorias={categorias}
        selectedLigas={selectedLigas}
        selectedCategorias={selectedCategorias}
        ligaSearch={ligaSearch}
        onToggleLiga={toggleLiga}
        onToggleCategoria={toggleCategoria}
        onLigaSearch={setLigaSearch}
        onClear={clearAll}
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#474747]/20 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
            MOSTRANDO {filteredProducts.length} RESULTADO
            {filteredProducts.length !== 1 ? "S" : ""}
          </p>
          <SortDropdown value={sortBy} onChange={(v) => { setSortBy(v); resetPage(); }} />
        </div>

        <FilterChips
          selectedLigas={selectedLigas}
          selectedCategorias={selectedCategorias}
          ligas={ligas}
          categorias={categorias}
          onRemoveLiga={toggleLiga}
          onRemoveCategoria={toggleCategoria}
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
