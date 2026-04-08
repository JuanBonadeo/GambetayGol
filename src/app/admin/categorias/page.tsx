"use client";

import { useEffect, useState } from "react";

interface CatStats {
  nombre: string;
  count: number;
}

const CATEGORIAS: CatStats[] = [
  { nombre: "Fan", count: 0 },
  { nombre: "Jugador", count: 0 },
  { nombre: "Retro", count: 0 },
];

const descriptions: Record<string, string> = {
  Fan: "Camisetas de hincha — réplicas y versiones económicas",
  Jugador: "Versión de jugador — calidad y corte de competición",
  Retro: "Ediciones históricas y colecciones vintage",
};

export default function CategoriasPage() {
  const [stats, setStats] = useState<CatStats[]>(CATEGORIAS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(({ data }) => {
        const counts: Record<string, number> = { Fan: 0, Jugador: 0, Retro: 0 };
        (data || []).forEach((p: { categoria: string }) => {
          if (counts[p.categoria] !== undefined) counts[p.categoria]++;
        });
        setStats(CATEGORIAS.map((c) => ({ ...c, count: counts[c.nombre] })));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Clasificación</h1>
        <p className="text-2xl font-bold text-white">Categorías</p>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Slug</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Descripción</th>
              <th className="px-5 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Productos</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((cat) => (
              <tr key={cat.nombre} className="border-b border-[#1e1e1e]/50 hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] flex-shrink-0" />
                    <span className="text-white text-xs font-medium">{cat.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <code className="text-xs text-gray-500 bg-[#0a0a0a] px-2 py-0.5 rounded border border-[#1e1e1e]">
                    {cat.nombre}
                  </code>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {descriptions[cat.nombre]}
                </td>
                <td className="px-5 py-4 text-center">
                  {loading ? (
                    <div className="h-3 w-6 bg-[#1e1e1e] rounded animate-pulse mx-auto" />
                  ) : (
                    <span className="text-gray-300 text-xs font-medium tabular-nums">{cat.count}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-[#111] border border-[#1e1e1e] rounded-xl">
        <p className="text-xs text-gray-600">
          Las categorías son valores fijos del sistema (enum). Para agregar nuevas categorías,
          se requiere una migración de base de datos.
        </p>
      </div>
    </div>
  );
}
