"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/types";
import CheckoutModal from "./CheckoutModal";

export default function CartSidepanel() {
  const { items, isOpen, totalItems, totalPrice, formattedTotal, removeItem, updateQty, clear, closeCart } =
    useCart();
  const totalSavings = items.reduce(
    (acc, i) => acc + Math.max(0, i.originalPrice - i.price) * i.quantity,
    0
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={closeCart}
            />

            {/* Panel */}
            <motion.aside
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-[420px] z-[61] bg-[#1b1b1b] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#474747]/20">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    CARRITO
                  </h2>
                  {totalItems > 0 && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6] mt-0.5">
                      {totalItems} {totalItems === 1 ? "ARTÍCULO" : "ARTÍCULOS"}
                    </p>
                  )}
                </div>
                <button
                  onClick={closeCart}
                  className="text-[#c6c6c6] hover:text-white transition-colors p-1"
                  aria-label="Cerrar carrito"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <EmptyState />
                ) : (
                  <ul className="divide-y divide-[#474747]/20">
                    {items.map((item) => (
                      <CartItemRow
                        key={item.variantId}
                        item={item}
                        onRemove={() => removeItem(item.variantId)}
                        onUpdateQty={(qty) => updateQty(item.variantId, qty)}
                      />
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-[#474747]/20 px-6 py-6 space-y-4 bg-[#1b1b1b]">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                      TOTAL
                    </span>
                    <span className="text-2xl font-black text-[#34b5fa] tracking-tighter">
                      {formattedTotal}
                    </span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
                        AHORRO
                      </span>
                      <span className="text-sm font-black text-green-500">
                        -{formatPrice(totalSavings)}
                      </span>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full py-4 bg-white text-[#001e2c] text-sm font-black uppercase tracking-widest hover:bg-[#34b5fa] hover:text-[#001e2f] transition-colors duration-200"
                  >
                    FINALIZAR COMPRA
                  </button>

                  {/* Clear */}
                  <button
                    onClick={clear}
                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-[#474747] hover:text-[#c6c6c6] transition-colors duration-200"
                  >
                    VACIAR CARRITO
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        totalPrice={totalPrice}
      />
    </>
  );
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: import("@/context/CartContext").CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  return (
    <li className="flex gap-4 px-6 py-5">
      {/* Image */}
      <div className="w-20 h-24 bg-[#2a2a2a] flex-none overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.nombre}
            width={80}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaceholderIcon />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <p className="text-xs font-black uppercase tracking-tight text-white leading-snug truncate">
            {item.nombre}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6] mt-1">
            TALLA: {item.talla}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-0">
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center bg-[#2a2a2a] text-[#c6c6c6] hover:text-white hover:bg-[#353535] transition-colors text-base font-black"
              aria-label="Reducir cantidad"
            >
              −
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-xs font-black text-white bg-[#353535]">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center bg-[#2a2a2a] text-[#c6c6c6] hover:text-white hover:bg-[#353535] transition-colors text-base font-black"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          {/* Price + remove */}
          <div className="flex flex-col items-end gap-1">
            {item.originalPrice > item.price && (
              <span className="text-[10px] text-[#474747] line-through">
                {formatPrice(item.originalPrice * item.quantity)}
              </span>
            )}
            <span className="text-sm font-black text-[#34b5fa]">
              {formatPrice(item.price * item.quantity)}
            </span>
            <button
              onClick={onRemove}
              className="text-[10px] font-black uppercase tracking-widest text-[#474747] hover:text-white transition-colors duration-200"
            >
              QUITAR
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-24 gap-6">
      <div className="text-[#2a2a2a]">
        <EmptyCartIcon />
      </div>
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-widest text-white mb-2">
          TU CARRITO ESTÁ VACÍO
        </p>
        <p className="text-[11px] font-black uppercase tracking-widest text-[#474747]">
          AGREGÁ PRODUCTOS PARA COMENZAR
        </p>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

function PlaceholderIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#474747"
      strokeWidth="1.5"
      strokeLinecap="square"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function EmptyCartIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="square"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
