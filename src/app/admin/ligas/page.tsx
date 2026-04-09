"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FormDrawer } from "@/components/admin/FormDrawer";
import { useToast } from "@/components/admin/Toast";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import ImageUploader, { ProductImageEntry } from "@/components/admin/ImageUploader";

interface Pais { id: string; nombre: string; }
interface Liga {
  id: string;
  nombre: string;
  slug: string;
  logo: string | null;
  paisId: string;
  pais: { nombre: string };
  clubes: { id: string }[];
}

const emptyForm = { nombre: "", slug: "", paisId: "" };

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function LigasPage() {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [paises, setPaises] = useState<Pais[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoImages, setLogoImages] = useState<ProductImageEntry[]>([]);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const [lRes, pRes] = await Promise.all([
      fetch("/api/ligas"),
      fetch("/api/paises"),
    ]);
    setLigas((await lRes.json()).data || []);
    setPaises((await pRes.json()).data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setLogoImages([]);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (l: Liga) => {
    setEditingId(l.id);
    setForm({ nombre: l.nombre, slug: l.slug, paisId: l.paisId });
    setLogoImages(l.logo ? [{ url: l.logo, orden: 0, esPrincipal: true }] : []);
    setFormError("");
    setDrawerOpen(true);
  };

  const handleNombre = (nombre: string) => {
    setForm((f) => ({ ...f, nombre, slug: editingId ? f.slug : toSlug(nombre) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const logo = logoImages[0]?.url ?? null;
    const url = editingId ? `/api/ligas/${editingId}` : "/api/ligas";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, logo }),
    });

    setFormLoading(false);
    if (!res.ok) {
      const { details } = await res.json();
      setFormError(typeof details === "string" ? details : JSON.stringify(details));
      return;
    }

    toast(editingId ? "Liga actualizada" : "Liga creada");
    setDrawerOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!await confirm("¿Eliminar esta liga?")) return;
    setDeletingId(id);
    await fetch(`/api/ligas/${id}`, { method: "DELETE" });
    setDeletingId(null);
    toast("Liga eliminada", "error");
    loadData();
  };

  const filtered = ligas.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.nombre.toLowerCase().includes(q) || l.pais?.nombre.toLowerCase().includes(q);
  });

  const inputCls = "w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] transition-colors";
  const labelCls = "block text-xs text-gray-500 mb-1 font-medium";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Competencias</h1>
          <p className="text-2xl font-bold text-white">Ligas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#38bdf8] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#7dd3fc] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Liga
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar ligas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider w-12">Logo</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">País</th>
              <th className="px-5 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Clubes</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]/50">
                  <td className="px-5 py-3"><div className="w-9 h-9 rounded-md bg-[#1e1e1e] animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-3 w-32 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-3 w-24 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-3 w-8 bg-[#1e1e1e] rounded animate-pulse mx-auto" /></td>
                  <td className="px-5 py-3"></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <svg className="text-gray-700 mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6" />
                      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                    </svg>
                    <p className="text-gray-400 text-sm font-medium mb-1">Sin ligas</p>
                    <p className="text-gray-600 text-xs mb-4">
                      {search ? "Probá con otro término" : "Agregá la primera liga"}
                    </p>
                    {!search && (
                      <button onClick={openCreate} className="text-xs bg-[#38bdf8] text-black px-3 py-1.5 rounded-md font-semibold hover:bg-[#7dd3fc] transition-colors">
                        + Nueva Liga
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((l, i) => (
                  <motion.tr
                    key={l.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => openEdit(l)}
                    className={`border-b border-[#1e1e1e]/50 hover:bg-white/[0.03] transition-colors group cursor-pointer ${deletingId === l.id ? "opacity-40" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <div className="w-9 h-9 rounded-md bg-[#1a1a1a] overflow-hidden border border-[#1e1e1e] flex items-center justify-center">
                        {l.logo ? (
                          <Image src={l.logo} alt={l.nombre} width={36} height={36} className="object-contain p-0.5" />
                        ) : (
                          <svg className="text-gray-700" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="6" />
                            <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white text-xs font-medium">{l.nombre}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{l.pais?.nombre}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-gray-400 text-xs tabular-nums">{l.clubes?.length ?? 0}</span>
                    </td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(l.id)}
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

      {/* Drawer */}
      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Editar liga" : "Nueva liga"}
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
              required className={inputCls}
              value={form.nombre}
              onChange={(e) => handleNombre(e.target.value)}
              placeholder="Primera División"
            />
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <input
              required className={inputCls}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="primera-division"
            />
          </div>

          <div>
            <label className={labelCls}>País</label>
            <select
              required className={inputCls}
              value={form.paisId}
              onChange={(e) => setForm({ ...form, paisId: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              {paises.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Logo</label>
            <ImageUploader
              images={logoImages}
              onChange={(imgs) => setLogoImages(imgs.slice(0, 1))}
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-[#1e1e1e]">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-[#38bdf8] text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-[#7dd3fc] disabled:opacity-50 transition-colors"
            >
              {formLoading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear liga"}
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
