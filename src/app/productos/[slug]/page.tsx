import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Product, ApiResponse } from "@/types";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import RelatedProducts from "@/components/product/RelatedProducts";
import PageTransition from "@/components/ui/PageTransition";

async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json: ApiResponse<Product[]> = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const products = await getAllProducts();
  const product = products.find((p) => p.slug === params.slug);
  if (!product) return { title: "Producto no encontrado — Gambeta y Gol" };
  return {
    title: `${product.nombre} — ${product.club.nombre} | Gambeta y Gol`,
    description:
      product.descripcion ??
      `${product.nombre} de ${product.club.nombre}. Categoría ${product.categoria}.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const products = await getAllProducts();
  const product = products.find((p) => p.slug === params.slug);

  if (!product) notFound();

  return (
    <PageTransition>
      <div className="bg-[#131313] min-h-screen">
        <ProductDetailClient product={product} />
        <RelatedProducts
          products={products}
          currentSlug={product.slug}
          currentClubId={product.clubId}
          currentCategoria={product.categoria}
        />
      </div>
    </PageTransition>
  );
}
