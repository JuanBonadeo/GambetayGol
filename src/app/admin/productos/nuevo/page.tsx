"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NuevoProducto() {
  const router = useRouter();
  const [clubes, setClubes] = useState([]);
  const [form, setForm] = useState({
    nombre: "", slug: "", descripcion: "", categoria: "Fan", precio: 0, clubId: "", destacado: false, activo: true
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clubs").then(r => r.json()).then(d => setClubes(d.data || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify({ ...form, precio: Number(form.precio) })
    });
    if(!res.ok) {
      const { details } = await res.json();
      setError(JSON.stringify(details));
      return;
    }
    router.push("/admin/productos");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Nuevo Producto</h2>
      {error && <div className="mb-4 p-3 bg-red-900/50 text-red-500 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded-lg border border-gray-800 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Nombre</label><input required className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} /></div>
        <div><label className="block text-sm text-gray-400 mb-1">Slug</label><input required className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.slug} onChange={e=>setForm({...form, slug: e.target.value})} /></div>
        <div><label className="block text-sm text-gray-400 mb-1">Descripción</label><textarea className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.descripcion} onChange={e=>setForm({...form, descripcion: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-400 mb-1">Categoría</label><select required className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.categoria} onChange={e=>setForm({...form, categoria: e.target.value})}><option value="Fan">Fan</option><option value="Jugador">Jugador</option><option value="Retro">Retro</option></select></div>
          <div><label className="block text-sm text-gray-400 mb-1">Precio</label><input required type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.precio} onChange={e=>setForm({...form, precio: Number(e.target.value)})} /></div>
        </div>
        <div><label className="block text-sm text-gray-400 mb-1">Club</label><select required className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.clubId} onChange={e=>setForm({...form, clubId: e.target.value})}><option value="">Seleccione</option>{clubes.map((c:any)=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
        <div className="flex gap-4">
           <label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={form.destacado} onChange={e=>setForm({...form, destacado: e.target.checked})} /> Destacado</label>
           <label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={form.activo} onChange={e=>setForm({...form, activo: e.target.checked})} /> Activo</label>
        </div>
        <div className="pt-4 flex gap-4">
          <button type="submit" className="bg-[#38bdf8] text-black px-4 py-2 rounded font-medium hover:bg-[#0284c7]">Guardar</button>
          <Link href="/admin/productos" className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
