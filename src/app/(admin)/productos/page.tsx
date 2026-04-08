"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);

  const loadData = async () => {
    const res = await fetch("/api/products");
    setProductos((await res.json()).data || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: string) => {
    if(!confirm("Eliminar producto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Productos</h2>
        <Link href="/productos/nuevo" className="bg-[#38bdf8] text-black px-4 py-2 rounded font-medium hover:bg-[#0284c7]">Nuevo Producto</Link>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0a0a0a] text-gray-400">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Club</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4 w-40 border-l border-gray-800 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {productos.map((p: any) => (
              <tr key={p.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4">{p.nombre}</td>
                <td className="px-6 py-4">{p.club?.nombre}</td>
                <td className="px-6 py-4">{p.categoria}</td>
                <td className="px-6 py-4">${p.precio}</td>
                <td className="px-6 py-4 border-l border-gray-800 flex justify-center gap-4">
                  <Link href={`/productos/${p.id}`} className="text-blue-400 hover:text-blue-300">Editar</Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
