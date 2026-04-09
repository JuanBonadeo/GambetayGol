// Enums matching Prisma schema
export type Talla = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";
export type OfferType = "PORCENTAJE" | "MONTO_FIJO";

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pais {
  id: string;
  nombre: string;
  codigo: string;
}

export interface Liga {
  id: string;
  nombre: string;
  slug: string;
  logo: string | null;
  paisId: string;
  pais: Pais;
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  id: string;
  nombre: string;
  slug: string;
  escudo: string | null;
  ligaId: string;
  liga: Liga;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  orden: number;
  esPrincipal: boolean;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  talla: Talla;
  stock: number;
  sku: string;
  bajoPedido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  productId: string | null;
  variantId: string | null;
  tipo: OfferType;
  descuento: number;
  descripcion: string | null;
  activo: boolean;
  desde: string;
  hasta: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Product {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  categoriaId: string;
  categoria: Categoria;
  precio: number;
  destacado: boolean;
  bajoPedido: boolean;
  activo: boolean;
  clubId: string;
  club: Club;
  variants: ProductVariant[];
  images: ProductImage[];
  offers: Offer[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiResponse<T> {
  data: T;
}

// Helpers
export function getActiveOffer(product: Product): Offer | null {
  const now = new Date();
  return (
    product.offers.find(
      (o) =>
        o.activo &&
        o.deletedAt === null &&
        new Date(o.desde) <= now &&
        new Date(o.hasta) >= now
    ) ?? null
  );
}

export function getDiscountedPrice(product: Product): {
  finalPrice: number;
  originalPrice: number;
  discountPercent: number | null;
} {
  const offer = getActiveOffer(product);
  if (!offer) {
    return {
      finalPrice: product.precio,
      originalPrice: product.precio,
      discountPercent: null,
    };
  }
  let finalPrice = product.precio;
  if (offer.tipo === "PORCENTAJE") {
    finalPrice = product.precio * (1 - offer.descuento / 100);
  } else {
    finalPrice = product.precio - offer.descuento;
  }
  return {
    finalPrice: Math.max(0, finalPrice),
    originalPrice: product.precio,
    discountPercent: offer.tipo === "PORCENTAJE" ? offer.descuento : null,
  };
}

export function getPrimaryImage(product: Product): string | null {
  const primary = product.images.find((img) => img.esPrincipal);
  if (primary) return primary.url;
  const sorted = [...product.images].sort((a, b) => a.orden - b.orden);
  return sorted[0]?.url ?? null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
