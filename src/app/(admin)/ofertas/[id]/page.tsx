"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarOferta({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    productId: "", tipo: "PORCENTAJE", descuento: 0, descripcion: "", activo: true, desde: "", hasta: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProductos(d.data || []));
    fetch(`/api/offers/${params.id}`).then(r => r.json()).then(d => {
      if(d.data) {
        setForm({
          productId: d.data.productId || "", tipo: d.data.tipo, descuento: d.data.descuento, 
          descripcion: d.data.descripcion || "", activo: d.data.activo, 
          desde: d.data.desde ? new Date(d.data.desde).toISOString().slice(0, 16) : "", 
          hasta: d.data.hasta ? new Date(d.data.hasta).toISOString().slice(0, 16) : ""
        });
      }
    });
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { productId, ...rest } = form;
    const body: Record<string, any> = { 
        ...rest, 
        descuento: Number(form.descuento),
        desde: new Date(form.desde).toISOString(),
        hasta: new Date(form.hasta).toISOString()
    };
    if(productId) body.productId = productId;
    
    const res = await fetch(`/api/offers/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });
    if(!res.ok) {
      const { details } = await res.json();
      setError(JSON.stringify(details));
      return;
    }
    router.push("/ofertas");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Editar Oferta</h2>
      {error && <div className="mb-4 p-3 bg-red-900/50 text-red-500 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded-lg border border-gray-800 space-y-4">
        <div><label className="block text-sm text-gray-400 mb-1">Producto</label><select className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.productId} onChange={e=>setForm({...form, productId: e.target.value})}><option value="">Ninguno (Global o Variante)</option>{productos.map((p:any)=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></div>
        <div><label className="block text-sm text-gray-400 mb-1">Descripción</label><textarea className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.descripcion} onChange={e=>setForm({...form, descripcion: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-400 mb-1">Tipo</label><select required className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.tipo} onChange={e=>setForm({...form, tipo: e.target.value})}><option value="PORCENTAJE">Porcentaje</option><option value="MONTO_FIJO">Monto Fijo</option></select></div>
          <div><label className="block text-sm text-gray-400 mb-1">Descuento</label><input required type="number" step="0.01" className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.descuento} onChange={e=>setForm({...form, descuento: Number(e.target.value)})} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-400 mb-1">Desde</label><input required type="datetime-local" className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.desde} onChange={e=>setForm({...form, desde: e.target.value})} /></div>
          <div><label className="block text-sm text-gray-400 mb-1">Hasta</label><input required type="datetime-local" className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white" value={form.hasta} onChange={e=>setForm({...form, hasta: e.target.value})} /></div>
        </div>
        <div>
           <label className="flex items-center gap-2 text-sm text-gray-400 mt-2"><input type="checkbox" checked={form.activo} onChange={e=>setForm({...form, activo: e.target.checked})} /> Activo</label>
        </div>
        <div className="pt-4 flex gap-4">
          <button type="submit" className="bg-[#38bdf8] text-black px-4 py-2 rounded font-medium hover:bg-[#0284c7]">Guardar</button>
          <Link href="/ofertas" className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
