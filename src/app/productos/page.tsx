export const dynamic = "force-dynamic";

import { Product, Liga, Categoria, ApiResponse } from "@/types";
import { getBaseUrl } from "@/lib/base-url";
import ProductsClient from "@/components/products/ProductsClient";
import PageTransition from "@/components/ui/PageTransition";

async function getData() {
  const base = getBaseUrl();
  try {
    const [productsRes, ligasRes, categoriasRes] = await Promise.all([
      fetch(`${base}/api/products`, { cache: "no-store" }),
      fetch(`${base}/api/ligas`, { cache: "no-store" }),
      fetch(`${base}/api/categorias`, { cache: "no-store" }),
    ]);
    const products: ApiResponse<Product[]> = productsRes.ok ? await productsRes.json() : { data: [] };
    const ligas: ApiResponse<Liga[]> = ligasRes.ok ? await ligasRes.json() : { data: [] };
    const categorias: ApiResponse<Categoria[]> = categoriasRes.ok ? await categoriasRes.json() : { data: [] };
    return {
      products: products.data ?? [],
      ligas: ligas.data ?? [],
      categorias: categorias.data ?? [],
    };
  } catch {
    return { products: [], ligas: [], categorias: [] };
  }
}

interface ProductosPageProps {
  searchParams?: { categoria?: string; liga?: string; encargo?: string };
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const { products, ligas, categorias } = await getData();

  const initialCategoriaId = searchParams?.categoria
    ? categorias.find((c) => c.slug === searchParams.categoria || c.id === searchParams.categoria)?.id ?? null
    : null;

  const initialLigaId = searchParams?.liga
    ? ligas.find((l) => l.slug === searchParams.liga || l.id === searchParams.liga)?.id ?? null
    : null;

  const initialEncargo = searchParams?.encargo === "1";

  return (
    <PageTransition>
      <div className="bg-[#131313] min-h-screen">
        <div className="bg-[#131313] pt-36 pb-12 px-6 border-b border-[#474747]/20">
          <div className="max-w-[1600px] mx-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-3">
              TIENDA — CAMISETAS AUTÉNTICAS
            </p>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-white">
              PRODUCTOS
            </h1>
          </div>
        </div>

        <ProductsClient
          products={products}
          ligas={ligas}
          categorias={categorias}
          initialCategoriaId={initialCategoriaId}
          initialLigaId={initialLigaId}
          initialEncargo={initialEncargo}
        />
      </div>
    </PageTransition>
  );
}
