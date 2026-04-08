"use client";
import { useEffect, useState } from "react";

export default function LigasPage() {
  const [ligas, setLigas] = useState([]);
  const [paises, setPaises] = useState([]);
  
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [paisId, setPaisId] = useState("");

  const loadData = async () => {
    const res = await fetch("/api/ligas");
    const json = await res.json();
    setLigas(json.data || []);
    
    const resP = await fetch("/api/paises");
    const jsonP = await resP.json();
    setPaises(jsonP.data || []);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/ligas", {
      method: "POST",
      body: JSON.stringify({ nombre, slug, paisId })
    });
    setNombre(""); setSlug("");
    loadData();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Eliminar?")) return;
    await fetch(`/api/ligas/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ligas</h2>
      
      <form onSubmit={handleCreate} className="mb-8 p-4 bg-[#111] border border-gray-800 rounded flex gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre</label>
          <input required type="text" value={nombre} onChange={e=>setNombre(e.target.value)} className="w-full bg-black border border-gray-700 rounded px-3 py-2 outline-none focus:border-[#38bdf8]" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Slug</label>
          <input required type="text" value={slug} onChange={e=>setSlug(e.target.value)} className="w-full bg-black border border-gray-700 rounded px-3 py-2 outline-none focus:border-[#38bdf8]" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">País</label>
          <select required value={paisId} onChange={e=>setPaisId(e.target.value)} className="w-full bg-black border border-gray-700 rounded px-3 py-2 outline-none focus:border-[#38bdf8]">
            <option value="">Seleccione</option>
            {paises.map((p: any) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <button className="bg-[#38bdf8] text-black px-4 py-2 rounded font-medium hover:bg-[#0284c7]">Crear</button>
      </form>

      <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0a0a0a] text-gray-400">
            <tr>
              <th className="px-6 py-4 font-semibold uppercase">Nombre</th>
              <th className="px-6 py-4 font-semibold uppercase">Slug</th>
              <th className="px-6 py-4 font-semibold uppercase">País</th>
              <th className="px-6 py-4 font-semibold uppercase w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {ligas.map((liga: any) => (
              <tr key={liga.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4">{liga.nombre}</td>
                <td className="px-6 py-4">{liga.slug}</td>
                <td className="px-6 py-4">{liga.pais?.nombre}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => handleDelete(liga.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
