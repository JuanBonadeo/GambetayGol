"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormDrawer } from "@/components/admin/FormDrawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import { useToast } from "@/components/admin/Toast";

interface Product { id: string; nombre: string; }
interface Offer {
  id: string;
  tipo: string;
  descuento: number;
  descripcion: string | null;
  activo: boolean;
  desde: string;
  hasta: string;
  productId: string | null;
  product: Product | null;
}

const emptyForm = {
  productId: "", tipo: "PORCENTAJE", descuento: 0,
  descripcion: "", activo: true, desde: "", hasta: "",
};

function getOfferStatus(o: Offer) {
  const now = new Date();
  const desde = new Date(o.desde);
  const hasta = new Date(o.hasta);
  if (!o.activo) return "inactive" as const;
  if (hasta < now) return "offer-expired" as const;
  if (desde > now) return "inactive" as const;
  return "offer-active" as const;
}

export default function OfertasPage() {
  const { toast } = useToast();
  const [ofertas, setOfertas] = useState<Offer[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [oRes, pRes] = await Promise.all([
      fetch("/api/offers"),
      fetch("/api/products"),
    ]);
    setOfertas((await oRes.json()).data || []);
    setProductos((await pRes.json()).data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (o: Offer) => {
    setEditingId(o.id);
    setForm({
      productId: o.productId || "",
      tipo: o.tipo,
      descuento: o.descuento,
      descripcion: o.descripcion || "",
      activo: o.activo,
      desde: o.desde ? new Date(o.desde).toISOString().slice(0, 16) : "",
      hasta: o.hasta ? new Date(o.hasta).toISOString().slice(0, 16) : "",
    });
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const { productId, ...rest } = form;
    const body: Record<string, unknown> = {
      ...rest,
      descuento: Number(form.descuento),
      desde: new Date(form.desde).toISOString(),
      hasta: new Date(form.hasta).toISOString(),
    };
    if (productId) body.productId = productId;

    const url = editingId ? `/api/offers/${editingId}` : "/api/offers";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setFormLoading(false);
    if (!res.ok) {
      const { details } = await res.json();
      setFormError(typeof details === "string" ? details : JSON.stringify(details));
      return;
    }

    toast(editingId ? "Oferta actualizada" : "Oferta creada");
    setDrawerOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta oferta?")) return;
    setDeletingId(id);
    await fetch(`/api/offers/${id}`, { method: "DELETE" });
    setDeletingId(null);
    toast("Oferta eliminada", "error");
    loadData();
  };

  const inputCls = "w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] transition-colors";
  const labelCls = "block text-xs text-gray-500 mb-1 font-medium";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Promociones</h1>
          <p className="text-2xl font-bold text-white">Ofertas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#38bdf8] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#7dd3fc] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Oferta
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Tipo</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Descuento</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Producto</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Desde</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Hasta</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]/50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-3 bg-[#1e1e1e] rounded animate-pulse" style={{ width: j === 0 ? 60 : j === 1 ? 48 : j === 2 ? 120 : 72 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : ofertas.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <svg className="text-gray-700 mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <p className="text-gray-400 text-sm font-medium mb-1">Sin ofertas</p>
                    <p className="text-gray-600 text-xs mb-4">Creá la primera oferta</p>
                    <button onClick={openCreate} className="text-xs bg-[#38bdf8] text-black px-3 py-1.5 rounded-md font-semibold hover:bg-[#7dd3fc] transition-colors">
                      + Nueva Oferta
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {ofertas.map((o, i) => {
                  const status = getOfferStatus(o);
                  return (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => openEdit(o)}
                      className={`border-b border-[#1e1e1e]/50 hover:bg-white/[0.03] transition-colors group cursor-pointer ${deletingId === o.id ? "opacity-40" : ""}`}
                    >
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${
                          o.tipo === "PORCENTAJE"
                            ? "text-purple-400 bg-purple-950/40 border-purple-900/40"
                            : "text-amber-400 bg-amber-950/40 border-amber-900/40"
                        }`}>
                          {o.tipo === "PORCENTAJE" ? "%" : "$"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white text-xs font-medium tabular-nums">
                        {o.tipo === "PORCENTAJE" ? `${o.descuento}%` : `$${o.descuento.toLocaleString("es-AR")}`}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {o.product?.nombre ?? <span className="text-gray-600 italic">Global</span>}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(o.desde).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {new Date(o.hasta).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge variant={status} />
                      </td>
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(o.id)}
                          className="p-1.5 text-gray-700 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Editar oferta" : "Nueva oferta"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 bg-red-950/50 border border-red-900/40 text-red-400 rounded-lg text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className={labelCls}>Producto (opcional)</label>
            <select
              className={inputCls}
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
            >
              <option value="">Sin producto específico (global)</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Tipo de descuento</label>
            <div className="flex gap-2">
              {["PORCENTAJE", "MONTO_FIJO"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setForm({ ...form, tipo })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.tipo === tipo
                      ? "bg-[#38bdf8]/15 border-[#38bdf8]/40 text-[#38bdf8]"
                      : "bg-[#0a0a0a] border-[#1e1e1e] text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {tipo === "PORCENTAJE" ? "Porcentaje (%)" : "Monto fijo ($)"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Descuento {form.tipo === "PORCENTAJE" ? "(%)" : "(ARS)"}
            </label>
            <input
              required type="number" step="0.01" min="0"
              className={inputCls}
              value={form.descuento}
              onChange={(e) => setForm({ ...form, descuento: Number(e.target.value) })}
              placeholder="0"
            />
          </div>

          <div>
            <label className={labelCls}>Descripción (opcional)</label>
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción de la oferta..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Desde</label>
              <input
                required type="datetime-local"
                className={inputCls}
                value={form.desde}
                onChange={(e) => setForm({ ...form, desde: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Hasta</label>
              <input
                required type="datetime-local"
                className={inputCls}
                value={form.hasta}
                onChange={(e) => setForm({ ...form, hasta: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-[#1e1e1e]">
            <div>
              <p className="text-sm text-white font-medium">Activa</p>
              <p className="text-xs text-gray-500">La oferta se aplica en la tienda</p>
            </div>
            <ToggleSwitch
              checked={form.activo}
              onChange={(v) => setForm({ ...form, activo: v })}
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-[#1e1e1e]">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-[#38bdf8] text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-[#7dd3fc] disabled:opacity-50 transition-colors"
            >
              {formLoading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear oferta"}
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2.5 text-sm text-gray-400 border border-[#1e1e1e] rounded-lg hover:text-white hover:border-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </FormDrawer>
    </div>
  );
}
