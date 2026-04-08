"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FormDrawer } from "@/components/admin/FormDrawer";
import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import ImageUploader, { ProductImageEntry } from "@/components/admin/ImageUploader";

interface Club { id: string; nombre: string; }
interface Product {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  categoria: string;
  precio: number;
  destacado: boolean;
  bajoPedido: boolean;
  activo: boolean;
  clubId: string;
  club: { nombre: string };
  images: { url: string; orden: number; esPrincipal: boolean }[];
}

const CATEGORIAS = ["Fan", "Jugador", "Retro"];

const emptyForm = {
  nombre: "", slug: "", descripcion: "", categoria: "Fan",
  precio: 0, clubId: "", destacado: false, bajoPedido: false, activo: true,
};

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function ProductosPage() {
  const { toast } = useToast();
  const [productos, setProductos] = useState<Product[]>([]);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterClub, setFilterClub] = useState("");
  const [filterCat, setFilterCat] = useState("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<ProductImageEntry[]>([]);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/clubs"),
    ]);
    setProductos((await pRes.json()).data || []);
    setClubes((await cRes.json()).data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImages([]);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre, slug: p.slug, descripcion: p.descripcion || "",
      categoria: p.categoria, precio: p.precio, clubId: p.clubId,
      destacado: p.destacado, bajoPedido: p.bajoPedido, activo: p.activo,
    });
    setImages(
      (p.images ?? [])
        .sort((a, b) => a.orden - b.orden)
        .map((img) => ({ url: img.url, orden: img.orden, esPrincipal: img.esPrincipal }))
    );
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

    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, precio: Number(form.precio), images }),
    });

    setFormLoading(false);
    if (!res.ok) {
      const { details } = await res.json();
      setFormError(typeof details === "string" ? details : JSON.stringify(details));
      return;
    }

    toast(editingId ? "Producto actualizado" : "Producto creado");
    setDrawerOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    setDeletingId(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    toast("Producto eliminado", "error");
    loadData();
  };

  const handleToggle = async (p: Product, field: "destacado" | "activo") => {
    const updated = { ...p, [field]: !p[field] };
    setProductos((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: !p[field] } : x)));
    setSavingId(p.id);
    await fetch(`/api/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: updated.nombre, slug: updated.slug, descripcion: updated.descripcion,
        categoria: updated.categoria, precio: updated.precio, clubId: updated.clubId,
        destacado: updated.destacado, bajoPedido: updated.bajoPedido, activo: updated.activo,
        images: updated.images.map((i) => ({ url: i.url, orden: i.orden, esPrincipal: i.esPrincipal })),
      }),
    });
    setSavingId(null);
  };

  // Filtered list
  const filtered = productos.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nombre.toLowerCase().includes(q);
    const matchClub = !filterClub || p.clubId === filterClub;
    const matchCat = !filterCat || p.categoria === filterCat;
    return matchSearch && matchClub && matchCat;
  });

  const inputCls = "w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] transition-colors";
  const labelCls = "block text-xs text-gray-500 mb-1 font-medium";

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Catálogo</h1>
          <p className="text-2xl font-bold text-white">Productos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#38bdf8] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#7dd3fc] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] transition-colors"
          />
        </div>
        <select
          value={filterClub}
          onChange={(e) => setFilterClub(e.target.value)}
          className="bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8] transition-colors"
        >
          <option value="">Todos los clubes</option>
          {clubes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8] transition-colors"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || filterClub || filterCat) && (
          <button
            onClick={() => { setSearch(""); setFilterClub(""); setFilterCat(""); }}
            className="text-xs text-gray-500 hover:text-white px-3 py-2 rounded-lg border border-[#1e1e1e] hover:border-gray-600 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider w-12"></th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Club</th>
              <th className="px-5 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Categoría</th>
              <th className="px-5 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">Precio</th>
              <th className="px-5 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Destacado</th>
              <th className="px-5 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]/50">
                  <td className="px-5 py-3"><div className="w-9 h-9 rounded bg-[#1e1e1e] animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-3 w-36 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-3 w-24 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-3 w-16 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-5 py-3"><div className="h-3 w-16 bg-[#1e1e1e] rounded animate-pulse ml-auto" /></td>
                  <td className="px-5 py-3"><div className="h-5 w-9 bg-[#1e1e1e] rounded-full animate-pulse mx-auto" /></td>
                  <td className="px-5 py-3"><div className="h-5 w-9 bg-[#1e1e1e] rounded-full animate-pulse mx-auto" /></td>
                  <td className="px-5 py-3"></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <svg className="text-gray-700 mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                    <p className="text-gray-400 text-sm font-medium mb-1">Sin productos</p>
                    <p className="text-gray-600 text-xs mb-4">
                      {search || filterClub || filterCat ? "Probá con otros filtros" : "Creá el primer producto"}
                    </p>
                    {!search && !filterClub && !filterCat && (
                      <button onClick={openCreate} className="text-xs bg-[#38bdf8] text-black px-3 py-1.5 rounded-md font-semibold hover:bg-[#7dd3fc] transition-colors">
                        + Nuevo Producto
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-[#1e1e1e]/50 hover:bg-white/[0.02] transition-colors group ${deletingId === p.id ? "opacity-40" : ""}`}
                  >
                    {/* Thumbnail */}
                    <td className="px-5 py-3">
                      <div className="w-9 h-9 rounded-md bg-[#1a1a1a] overflow-hidden border border-[#1e1e1e] flex-shrink-0">
                        {p.images?.find((i) => i.esPrincipal)?.url ? (
                          <Image
                            src={p.images.find((i) => i.esPrincipal)!.url}
                            alt={p.nombre} width={36} height={36}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="text-gray-700" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-white text-xs font-medium">{p.nombre}</span>
                      {p.bajoPedido && <span className="ml-2"><StatusBadge variant="bajo-pedido" /></span>}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.club?.nombre}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.categoria}</td>
                    <td className="px-5 py-3 text-white text-xs font-medium text-right tabular-nums">
                      ${p.precio.toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ToggleSwitch
                        checked={p.destacado}
                        onChange={() => handleToggle(p, "destacado")}
                        disabled={savingId === p.id}
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ToggleSwitch
                        checked={p.activo}
                        onChange={() => handleToggle(p, "activo")}
                        disabled={savingId === p.id}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-gray-500 hover:text-[#38bdf8] hover:bg-[#38bdf8]/10 rounded transition-colors"
                          title="Editar"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Eliminar"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Drawer */}
      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Editar producto" : "Nuevo producto"}
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
              value={form.nombre}
              onChange={(e) => handleNombre(e.target.value)}
              placeholder="Camiseta Titular 2024"
            />
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <input
              required
              className={inputCls}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="camiseta-titular-2024"
            />
          </div>

          <div>
            <label className={labelCls}>Descripción</label>
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción opcional del producto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Categoría</label>
              <select
                required
                className={inputCls}
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              >
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Precio (ARS)</label>
              <input
                required type="number" step="1" min="0"
                className={inputCls}
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Club</label>
            <select
              required
              className={inputCls}
              value={form.clubId}
              onChange={(e) => setForm({ ...form, clubId: e.target.value })}
            >
              <option value="">Seleccionar club...</option>
              {clubes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-[#1e1e1e]">
            {[
              { key: "destacado" as const, label: "Destacado", desc: "Aparece en secciones destacadas" },
              { key: "bajoPedido" as const, label: "Bajo pedido", desc: "Se fabrica al momento del pedido" },
              { key: "activo" as const, label: "Activo", desc: "Visible en la tienda" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                <ToggleSwitch
                  checked={form[key]}
                  onChange={(v) => setForm({ ...form, [key]: v })}
                />
              </div>
            ))}
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}>Imágenes ({images.length})</label>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-[#1e1e1e]">
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-[#38bdf8] text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-[#7dd3fc] disabled:opacity-50 transition-colors"
            >
              {formLoading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
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
