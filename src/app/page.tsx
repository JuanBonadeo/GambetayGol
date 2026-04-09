export const dynamic = "force-dynamic";

import { Product, Liga, Categoria, ApiResponse } from "@/types";
import { getBaseUrl } from "@/lib/base-url";
import HeroSection from "@/components/home/HeroSection";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import ProductSlider from "@/components/home/ProductSlider";
import ProductsClient from "@/components/products/ProductsClient";
import PageTransition from "@/components/ui/PageTransition";
import AnimatedHeading from "@/components/ui/AnimatedHeading";

// South American country codes
const SA_CODES = new Set(["AR", "BR", "UY", "CL", "CO", "PE", "PY", "BO", "EC", "VE"]);
// European country codes
const EU_CODES = new Set(["GB", "ES", "IT", "DE", "FR", "PT", "NL", "BE", "RU", "TR", "GR", "SE", "NO", "DK"]);

async function getData(): Promise<{ products: Product[]; ligas: Liga[]; categorias: Categoria[] }> {
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
    return { products: products.data ?? [], ligas: ligas.data ?? [], categorias: categorias.data ?? [] };
  } catch {
    return { products: [], ligas: [], categorias: [] };
  }
}

export default async function HomePage() {
  const { products, ligas, categorias } = await getData();

  const retroProducts = products.filter((p) => p.categoria?.slug === "retro" && p.activo);

  const saProducts = retroProducts.filter((p) =>
    SA_CODES.has(p.club?.liga?.pais?.codigo ?? "")
  );
  const euProducts = retroProducts.filter((p) =>
    EU_CODES.has(p.club?.liga?.pais?.codigo ?? "")
  );

  // Fallback: if geographic split yields nothing, split retro in half
  const slider1 =
    saProducts.length > 0 ? saProducts.slice(0, 10) : retroProducts.slice(0, 8);
  const slider2 =
    euProducts.length > 0 ? euProducts.slice(0, 10) : retroProducts.slice(8, 16);

  return (
    <PageTransition>
      <HeroSection products={products} />
      <CategoriesGrid products={products} />

      <ProductSlider title="RETRO SUDAMÉRICA" products={slider1} />
      <ProductSlider title="RETRO EUROPA" products={slider2} />

      {/* All products with filters */}
      <section className="bg-[#1b1b1b] py-16 border-t border-[#474747]/10">
        <div className="px-6 max-w-[1600px] mx-auto mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-2">
            CATÁLOGO COMPLETO
          </p>
          <AnimatedHeading className="text-4xl font-black uppercase tracking-tighter text-white">
            TODOS LOS PRODUCTOS
          </AnimatedHeading>
        </div>
        <ProductsClient products={products} ligas={ligas} categorias={categorias} padTop={false} />
      </section>
    </PageTransition>
  );
}
