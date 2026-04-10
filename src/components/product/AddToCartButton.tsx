"use client";

import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  selectedVariantId: string | null;
  selectedTalla: string | null;
  price: number;
  originalPrice: number;
  image: string | null;
  isEncargo?: boolean;
  onEncargo?: () => void;
}

export default function AddToCartButton({
  productId,
  productName,
  selectedVariantId,
  selectedTalla,
  price,
  originalPrice,
  image,
  isEncargo = false,
  onEncargo,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleClick = () => {
    if (!selectedVariantId || !selectedTalla) return;
    if (isEncargo) {
      onEncargo?.();
      return;
    }
    addItem({
      productId,
      variantId: selectedVariantId,
      nombre: productName,
      talla: selectedTalla,
      price,
      originalPrice,
      image,
      quantity: 1,
    });
  };

  const disabled = !selectedVariantId;

  let label = "SELECCIONÁ UNA TALLA";
  if (!disabled) label = isEncargo ? "ENCARGAR" : "AGREGAR AL CARRITO";

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={`w-full py-5 text-sm font-black uppercase tracking-widest transition-all duration-300 ${
        disabled
          ? "bg-[#2a2a2a] text-[#474747] cursor-not-allowed"
          : isEncargo
          ? "bg-[#2a2a2a] text-white border border-[#34b5fa]/40 hover:bg-[#34b5fa]/10 hover:border-[#34b5fa]"
          : "bg-white text-[#001e2c] hover:bg-[#34b5fa] hover:text-[#001e2f]"
      }`}
    >
      {label}
    </motion.button>
  );
}
