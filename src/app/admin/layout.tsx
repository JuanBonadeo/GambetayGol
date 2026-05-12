"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { ToastProvider } from "@/components/admin/Toast";
import { ConfirmDialogProvider } from "@/components/admin/ConfirmDialog";

const navLinks = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    name: "Productos",
    href: "/admin/productos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    name: "Órdenes",
    href: "/admin/ordenes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    name: "Ofertas",
    href: "/admin/ofertas",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    name: "Clubes",
    href: "/admin/clubes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    name: "Ligas",
    href: "/admin/ligas",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    name: "Categorías",
    href: "/admin/categorias",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <ConfirmDialogProvider>
    <ToastProvider>
      <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans mt-20">
        {/* Sidebar */}
        <aside
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          className={`fixed left-0 top-0 h-screen border-r border-[#1e1e1e] bg-[#111] flex flex-col z-30 overflow-hidden transition-[width] duration-300 ease-out ${
            isExpanded ? "w-60 shadow-2xl shadow-black/60" : "w-16"
          }`}
        >
          {/* Logo */}
          <div className="px-5 py-5 border-b border-[#1e1e1e] flex items-center min-h-[57px]">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span
                className={`text-sm font-bold tracking-tight text-white transition-opacity duration-200 ${
                  isExpanded ? "opacity-100 delay-150" : "opacity-0"
                }`}
              >
                Gambeta y Gol
              </span>
              <span
                className={`text-[10px] font-semibold bg-[#38bdf8]/15 text-[#38bdf8] px-1.5 py-0.5 rounded border border-[#38bdf8]/20 transition-opacity duration-200 ${
                  isExpanded ? "opacity-100 delay-200" : "opacity-0"
                }`}
              >
                Admin
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  title={link.name}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150 whitespace-nowrap ${
                    isActive
                      ? "text-[#38bdf8] bg-[#38bdf8]/8 border-l-2 border-[#38bdf8] pl-[10px]"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent pl-[10px]"
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? "text-[#38bdf8]" : "text-gray-500"}`}>{link.icon}</span>
                  <span
                    className={`transition-opacity duration-200 ${
                      isExpanded ? "opacity-100 delay-150" : "opacity-0"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-[#1e1e1e]">
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-colors duration-150 border-l-2 border-transparent pl-[10px] whitespace-nowrap"
            >
              <span className="flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
              <span
                className={`transition-opacity duration-200 ${
                  isExpanded ? "opacity-100 delay-150" : "opacity-0"
                }`}
              >
                Cerrar sesión
              </span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="ml-16 flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </ToastProvider>
    </ConfirmDialogProvider>
  );
}
