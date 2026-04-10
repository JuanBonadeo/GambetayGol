"use client";

import { useState } from "react";
import { Product, getActiveOffer, getDiscountedPrice, formatPrice } from "@/types";
import ImageGallery from "./ImageGallery";
import SizeSelector, { isVirtualId, tallaFromVirtualId } from "./SizeSelector";
import AddToCartButton from "./AddToCartButton";
import CheckoutModal from "@/components/cart/CheckoutModal";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [encargoOpen, setEncargoOpen] = useState(false);

  const activeOffer = getActiveOffer(product);
  const { finalPrice, originalPrice, discountLabel } = getDiscountedPrice(product);
  const hasDiscount = finalPrice < originalPrice;

  const handleSelectSize = (variantId: string) => {
    setSelectedVariantId((prev) => (prev === variantId ? null : variantId));
  };

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? null;
  const isVirtual = selectedVariantId ? isVirtualId(selectedVariantId) : false;
  const selectedTalla = selectedVariant?.talla ?? (isVirtual && selectedVariantId ? tallaFromVirtualId(selectedVariantId) : null);
  const isEncargo = isVirtual || (selectedVariant ? selectedVariant.stock === 0 : product.variants.every((v) => v.stock === 0));
  const primaryImage = product.images.find((img) => img.esPrincipal)?.url ?? product.images[0]?.url ?? null;

  const encargoItem = selectedVariantId && selectedTalla
    ? [{
        productId: product.id,
        variantId: selectedVariantId,
        nombre: product.nombre,
        talla: selectedTalla,
        price: finalPrice,
        originalPrice,
        image: primaryImage,
        quantity: 1,
      }]
    : [];

  return (
    <>
    <CheckoutModal
      open={encargoOpen}
      onClose={() => setEncargoOpen(false)}
      items={encargoItem}
      totalPrice={finalPrice}
      mode="encargo"
    />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-36 pb-24 px-6 max-w-[1600px] mx-auto">
      {/* Left: Image gallery */}
      <div>
        <ImageGallery
          images={product.images}
          offer={activeOffer}
          productName={product.nombre}
        />
      </div>

      {/* Right: Product info */}
      <div className="flex flex-col gap-6">
        {/* Club / brand */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#34b5fa] mb-1">
            {product.club.nombre} — {product.club.liga?.nombre}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
            {product.categoria?.nombre}
          </p>
        </div>

        {/* Product name */}
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white leading-none">
          {product.nombre}
        </h1>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-white">
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-[#c6c6c6] line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-sm font-black text-[#34b5fa] uppercase tracking-wider">
                {discountLabel}
              </span>
            </>
          )}
        </div>

        {/* Size selector */}
        <SizeSelector
          variants={product.variants}
          selectedSize={selectedVariantId}
          onSelect={handleSelectSize}
        />

        {/* Add to cart */}
        <AddToCartButton
          productId={product.id}
          productName={product.nombre}
          selectedVariantId={selectedVariantId}
          selectedTalla={selectedTalla}
          price={finalPrice}
          originalPrice={originalPrice}
          image={primaryImage}
          isEncargo={isEncargo}
          onEncargo={() => setEncargoOpen(true)}
        />

        {/* Divider + description */}
        {product.descripcion && (
          <div className="pt-6 border-t border-[#474747]/20">
            <p className="text-sm text-[#c6c6c6] leading-relaxed">
              {product.descripcion}
            </p>
          </div>
        )}

        {/* Info rows */}
        <div className="pt-6 border-t border-[#474747]/20 space-y-4">
          <InfoRow
            icon={<ShippingIcon />}
            title="ENVÍO"
            text="Entrega en 3-7 días hábiles a todo el país"
          />
          <InfoRow
            icon={<ShieldIcon />}
            title="GARANTÍA"
            text="Producto auténtico con garantía de devolución"
          />
          <InfoRow
            icon={<ReturnIcon />}
            title="CAMBIOS"
            text="Cambios y devoluciones dentro de los 30 días"
          />
        </div>
      </div>
    </div>
    </>
  );
}

function InfoRow({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-[#34b5fa] flex-none mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">
          {title}
        </p>
        <p className="text-xs text-[#c6c6c6]">{text}</p>
      </div>
    </div>
  );
}

function ShippingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
  );
}
