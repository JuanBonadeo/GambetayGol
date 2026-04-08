"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { StatusBadge } from "@/components/admin/StatusBadge";

interface DashboardData {
  totalProducts: number;
  totalClubs: number;
  totalLigas: number;
  activeOffers: number;
  recentProducts: {
    id: string;
    nombre: string;
    categoria: string;
    precio: number;
    activo: boolean;
    club: { nombre: string };
    images: { url: string }[];
  }[];
  currentOffers: {
    id: string;
    tipo: string;
    descuento: number;
    activo: boolean;
    hasta: string;
    product: { nombre: string } | null;
  }[];
}

const statCards = [
  {
    key: "totalProducts" as const,
    label: "Total Productos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    key: "activeOffers" as const,
    label: "Ofertas Activas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    key: "totalClubs" as const,
    label: "Clubes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    key: "totalLigas" as const,
    label: "Ligas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Panel de administración</h1>
        <p className="text-2xl font-bold text-white">Dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.key} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{card.label}</span>
              <span className="text-[#38bdf8]">{card.icon}</span>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-[#1e1e1e] rounded animate-pulse" />
            ) : (
              <span className="text-3xl font-bold text-white tabular-nums">
                {data?.[card.key] ?? 0}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent products */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e1e1e]">
            <h2 className="text-sm font-semibold text-white">Productos recientes</h2>
            <p className="text-xs text-gray-500 mt-0.5">Últimos 5 agregados</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Producto</th>
                <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Categoría</th>
                <th className="px-5 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">Precio</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1e1e1e]/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#1e1e1e] animate-pulse flex-shrink-0" />
                        <div className="h-3 w-28 bg-[#1e1e1e] rounded animate-pulse" />
                      </div>
                    </td>
                    <td className="px-5 py-3"><div className="h-3 w-16 bg-[#1e1e1e] rounded animate-pulse" /></td>
                    <td className="px-5 py-3"><div className="h-3 w-16 bg-[#1e1e1e] rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : data?.recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-500 text-sm">Sin productos todavía</td>
                </tr>
              ) : (
                data?.recentProducts.map((p) => (
                  <tr key={p.id} className="border-b border-[#1e1e1e]/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-[#1a1a1a] overflow-hidden flex-shrink-0 border border-[#1e1e1e]">
                          {p.images[0] ? (
                            <Image src={p.images[0].url} alt={p.nombre} width={32} height={32} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full bg-[#1e1e1e]" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium line-clamp-1">{p.nombre}</p>
                          <p className="text-gray-500 text-xs">{p.club?.nombre}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.categoria}</td>
                    <td className="px-5 py-3 text-white text-xs font-medium text-right tabular-nums">
                      ${p.precio.toLocaleString("es-AR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Active offers */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e1e1e]">
            <h2 className="text-sm font-semibold text-white">Ofertas activas</h2>
            <p className="text-xs text-gray-500 mt-0.5">Próximas a vencer</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]">
                <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Producto</th>
                <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Descuento</th>
                <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Vence</th>
                <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#1e1e1e]/50">
                    <td className="px-5 py-3"><div className="h-3 w-28 bg-[#1e1e1e] rounded animate-pulse" /></td>
                    <td className="px-5 py-3"><div className="h-3 w-12 bg-[#1e1e1e] rounded animate-pulse" /></td>
                    <td className="px-5 py-3"><div className="h-3 w-20 bg-[#1e1e1e] rounded animate-pulse" /></td>
                    <td className="px-5 py-3"><div className="h-4 w-14 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : data?.currentOffers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-500 text-sm">Sin ofertas activas</td>
                </tr>
              ) : (
                data?.currentOffers.map((o) => {
                  const now = new Date();
                  const hasta = new Date(o.hasta);
                  const isExpired = hasta < now;
                  return (
                    <tr key={o.id} className="border-b border-[#1e1e1e]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-white text-xs">{o.product?.nombre ?? "Global"}</td>
                      <td className="px-5 py-3 text-gray-300 text-xs font-medium tabular-nums">
                        {o.tipo === "PORCENTAJE" ? `${o.descuento}%` : `$${o.descuento}`}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {hasta.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge variant={isExpired ? "offer-expired" : "offer-active"} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
