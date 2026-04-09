"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormDrawer } from "@/components/admin/FormDrawer";
import { useToast } from "@/components/admin/Toast";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Categoria { id: string; nombre: string; slug: string; }

export default function CategoriasPage() {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/categorias");
    setCategorias((await res.json()).data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setNombre("");
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (c: Categoria) => {
    setEditingId(c.id);
    setNombre(c.nombre);
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const url = editingId ? `/api/categorias/${editingId}` : "/api/categorias";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });

    setFormLoading(false);
    if (!res.ok) {
      const { error } = await res.json();
      setFormError(error ?? "Error al guardar");
      return;
    }

    toast(editingId ? "Categoría actualizada" : "Categoría creada");
    setDrawerOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!await confirm("¿Eliminar esta categoría?", "Los productos asociados quedarán sin categoría.")) return;
    setDeletingId(id);
    await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    setDeletingId(null);
    toast("Categoría eliminada", "error");
    loadData();
  };

  const inputCls = "w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] transition-colors";
  const labelCls = "block text-xs text-gray-500 mb-1 font-medium";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Clasificación</h1>
          <p className="text-2xl font-bold text-white">Categorías</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#38bdf8] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#7dd3fc] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Slug</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]/50">
                  <td className="px-5 py-4"><div className="h-3 w-24 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-5 py-4"><div className="h-3 w-32 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td></td>
                </tr>
              ))
            ) : categorias.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-gray-400 text-sm font-medium mb-1">Sin categorías</p>
                    <p className="text-gray-600 text-xs mb-4">Creá la primera categoría</p>
                    <button onClick={openCreate} className="text-xs bg-[#38bdf8] text-black px-3 py-1.5 rounded-md font-semibold hover:bg-[#7dd3fc] transition-colors">
                      + Nueva Categoría
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {categorias.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => openEdit(c)}
                    className={`border-b border-[#1e1e1e]/50 hover:bg-white/[0.03] transition-colors group cursor-pointer ${deletingId === c.id ? "opacity-40" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] flex-shrink-0" />
                        <span className="text-white text-xs font-medium">{c.nombre}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs text-gray-500 bg-[#0a0a0a] px-2 py-0.5 rounded border border-[#1e1e1e]">
                        {c.slug}
                      </code>
                    </td>
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(c.id)}
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
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Editar categoría" : "Nueva categoría"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 bg-red-950/50 border border-red-900/40 text-red-400 rounded-lg text-xs">
              {formError}
            </div>
          )}
          <div>
            <label className={labelCls}>Nombre</label>
            <input
              required
              className={inputCls}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Fan, Jugador, Retro..."
            />
          </div>
          <div className="flex gap-3 pt-2 border-t border-[#1e1e1e]">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-[#38bdf8] text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-[#7dd3fc] disabled:opacity-50 transition-colors"
            >
              {formLoading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear categoría"}
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
