"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "INICIO" },
  { href: "/productos", label: "PRODUCTOS" },
  { href: "/contacto", label: "CONTACTO" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openCart, totalItems } = useCart();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl">
      <div className="flex flex-col w-full px-6 py-4 max-w-[1600px] mx-auto md:flex-row md:items-center md:justify-between">
        {/* Logo + mobile toggle */}
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Gambeta y Gol — Inicio">
            <Image
              src="/logo.svg"
              alt="Gambeta y Gol"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-4 md:hidden">
            {/* Cart icon */}
            <button
              onClick={openCart}
              className="relative text-[#c6c6c6] hover:text-white transition-colors"
              aria-label="Abrir carrito"
            >
              <CartIcon />
              {totalItems > 0 && <CartBadge count={totalItems} />}
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-white"
              aria-label="Menú"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-black uppercase tracking-tighter text-sm transition-colors duration-300 pb-1 ${
                isActive(link.href)
                  ? "text-[#34b5fa] border-b-2 border-[#34b5fa]"
                  : "text-[#c6c6c6] hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={openCart}
            className="relative text-[#c6c6c6] hover:text-white transition-colors ml-4"
            aria-label="Abrir carrito"
          >
            <CartIcon />
            {totalItems > 0 && <CartBadge count={totalItems} />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-[#131313]/95 border-t border-[#474747]/20"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`font-black uppercase tracking-tighter text-base py-2 transition-colors duration-300 ${
                    isActive(link.href)
                      ? "text-[#34b5fa]"
                      : "text-[#c6c6c6] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function CartBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-[#34b5fa] text-[#001e2f] text-[9px] font-black px-1">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
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

function CartIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
