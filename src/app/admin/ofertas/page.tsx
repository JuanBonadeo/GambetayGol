"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState([]);

  const loadData = async () => {
    const res = await fetch("/api/offers");
    setOfertas((await res.json()).data || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Eliminar oferta?")) return;
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ofertas</h2>
        <Link href="/admin/ofertas/nueva" className="bg-[#38bdf8] text-black px-4 py-2 rounded font-medium hover:bg-[#0284c7]">Nueva Oferta</Link>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0a0a0a] text-gray-400">
            <tr>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Descuento</th>
              <th className="px-6 py-4">Activo</th>
              <th className="px-6 py-4">Vigencia</th>
              <th className="px-6 py-4 w-40 border-l border-gray-800 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {ofertas.map((o: any) => (
              <tr key={o.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4">{o.tipo}</td>
                <td className="px-6 py-4">{o.descuento} {o.tipo === 'PORCENTAJE' ? '%' : '$'}</td>
                <td className="px-6 py-4">{o.activo ? "Sí" : "No"}</td>
                <td className="px-6 py-4">
                  {new Date(o.desde).toLocaleDateString()} - {new Date(o.hasta).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 border-l border-gray-800 flex justify-center gap-4">
                  <Link href={`/admin/ofertas/${o.id}`} className="text-blue-400 hover:text-blue-300">Editar</Link>
                  <button onClick={() => handleDelete(o.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
