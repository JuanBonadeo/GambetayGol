"use client";

import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  selectedVariantId: string | null;
  selectedTalla: string | null;
  price: number;
  image: string | null;
}

export default function AddToCartButton({
  productId,
  productName,
  selectedVariantId,
  selectedTalla,
  price,
  image,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  const handleClick = () => {
    if (!selectedVariantId || !selectedTalla) return;
    addItem({
      productId,
      variantId: selectedVariantId,
      nombre: productName,
      talla: selectedTalla,
      price,
      image,
      quantity: 1,
    });
  };

  const disabled = !selectedVariantId;

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={`w-full py-5 text-sm font-black uppercase tracking-widest transition-all duration-300 ${
        disabled
          ? "bg-[#2a2a2a] text-[#474747] cursor-not-allowed"
          : "bg-white text-[#001e2c] hover:bg-[#34b5fa] hover:text-[#001e2f]"
      }`}
    >
      {disabled ? "SELECCIONÁ UNA TALLA" : "AGREGAR AL CARRITO"}
    </motion.button>
  );
}
