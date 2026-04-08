import { Product, Liga, ApiResponse, Categoria } from "@/types";
import ProductsClient from "@/components/products/ProductsClient";
import PageTransition from "@/components/ui/PageTransition";

async function getData() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const [productsRes, ligasRes] = await Promise.all([
      fetch(`${base}/api/products`, { cache: "no-store" }),
      fetch(`${base}/api/ligas`, { cache: "no-store" }),
    ]);
    const products: ApiResponse<Product[]> = productsRes.ok
      ? await productsRes.json()
      : { data: [] };
    const ligas: ApiResponse<Liga[]> = ligasRes.ok
      ? await ligasRes.json()
      : { data: [] };
    return { products: products.data ?? [], ligas: ligas.data ?? [] };
  } catch {
    return { products: [], ligas: [] };
  }
}

interface ProductosPageProps {
  searchParams?: { categoria?: string };
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const { products, ligas } = await getData();

  const validCategorias: Categoria[] = ["Fan", "Jugador", "Retro"];
  const initialCategoria =
    searchParams?.categoria && validCategorias.includes(searchParams.categoria as Categoria)
      ? (searchParams.categoria as Categoria)
      : null;

  return (
    <PageTransition>
      <div className="bg-[#131313] min-h-screen">
        {/* Page header */}
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
          initialCategoria={initialCategoria}
        />
      </div>
    </PageTransition>
  );
}
