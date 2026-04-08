import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidepanel from "@/components/cart/CartSidepanel";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gambeta y Gol — Camisetas de Fútbol Retro",
  description:
    "La tienda de camisetas de fútbol retro más exclusiva. Colecciones originales de todo el mundo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-[#131313] text-[#e2e2e2]">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartSidepanel />
        </CartProvider>
      </body>
    </html>
  );
}
