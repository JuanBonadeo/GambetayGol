"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FormDrawer } from "@/components/admin/FormDrawer";
import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";
import ImageUploader, { ProductImageEntry } from "@/components/admin/ImageUploader";

interface Liga { id: string; nombre: string; }
interface Categoria { id: string; nombre: string; }
interface Club { id: string; nombre: string; ligaId: string; }
interface ProductVariant { talla: string; stock: number; sku: string; }
interface Offer { activo: boolean; tipo: "PORCENTAJE" | "MONTO_FIJO"; descuento: number; desde: string; hasta: string; deletedAt: string | null; }
interface Product {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  categoriaId: string;
  categoria: Categoria;
  precio: number;
  destacado: boolean;
  activo: boolean;
  clubId: string;
  club: { nombre: string };
  images: { url: string; orden: number; esPrincipal: boolean }[];
  variants: ProductVariant[];
  offers: Offer[];
}

function getActiveOffer(offers: Offer[]): Offer | null {
  const now = new Date();
  return offers?.find(
    (o) => o.activo && o.deletedAt === null && new Date(o.desde) <= now && new Date(o.hasta) >= now
  ) ?? null;
}

const TALLAS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
type Talla = typeof TALLAS[number];

interface VariantEntry {
  talla: Talla;
  stock: number;
}

function buildDefaultVariants(existing?: ProductVariant[]): VariantEntry[] {
  return TALLAS.map((talla) => ({
    talla,
    stock: existing?.find((v) => v.talla === talla)?.stock ?? 0,
  }));
}

const emptyForm = {
  nombre: "", slug: "", descripcion: "", categoriaId: "",
  precio: 0, clubId: "", destacado: false, activo: true,
};

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function ProductosPage() {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();
  const [productos, setProductos] = useState<Product[]>([]);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterLiga, setFilterLiga] = useState("");
  const [filterClub, setFilterClub] = useState("");
  const [filterCat, setFilterCat] = useState("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<ProductImageEntry[]>([]);
  const [variantEntries, setVariantEntries] = useState<VariantEntry[]>(() => buildDefaultVariants());
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pRes, cRes, lRes, catRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/clubs"),
      fetch("/api/ligas"),
      fetch("/api/categorias"),
    ]);
    setProductos((await pRes.json()).data || []);
    setClubes((await cRes.json()).data || []);
    setLigas((await lRes.json()).data || []);
    setCategorias((await catRes.json()).data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImages([]);
    setVariantEntries(buildDefaultVariants());
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre, slug: p.slug, descripcion: p.descripcion || "",
      categoriaId: p.categoriaId, precio: p.precio, clubId: p.clubId,
      destacado: p.destacado, activo: p.activo,
    });
    setImages(
      (p.images ?? [])
        .sort((a, b) => a.orden - b.orden)
        .map((img) => ({ url: img.url, orden: img.orden, esPrincipal: img.esPrincipal }))
    );
    setVariantEntries(buildDefaultVariants(p.variants ?? []));
    setFormError("");
    setDrawerOpen(true);
  };

  const handleNombre = (nombre: string) => {
    setForm((f) => ({ ...f, nombre, slug: toSlug(nombre) }));
  };

  const updateVariantStock = (talla: Talla, stock: number) => {
    setVariantEntries((prev) =>
      prev.map((v) => (v.talla === talla ? { ...v, stock } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";
    const slug = form.slug;
    const variants = variantEntries
      .filter((v) => v.stock > 0)
      .map(({ talla, stock }) => ({
        talla,
        stock,
        sku: `${slug}-${talla.toLowerCase()}`,
      }));
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, precio: Number(form.precio), images, variants }),
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
    if (!await confirm("¿Eliminar este producto?")) return;
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
        categoriaId: updated.categoriaId, precio: updated.precio, clubId: updated.clubId,
        destacado: updated.destacado, activo: updated.activo,
        images: updated.images.map((i) => ({ url: i.url, orden: i.orden, esPrincipal: i.esPrincipal })),
      }),
    });
    setSavingId(null);
  };

  // Clubs visible en el selector (filtrados por liga seleccionada)
  const clubesFiltrados = filterLiga
    ? clubes.filter((c) => c.ligaId === filterLiga)
    : clubes;

  // Filtered list
  const filtered = productos.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.nombre.toLowerCase().includes(q);
    const matchLiga = !filterLiga || clubes.find((c) => c.id === p.clubId)?.ligaId === filterLiga;
    const matchClub = !filterClub || p.clubId === filterClub;
    const matchCat = !filterCat || p.categoriaId === filterCat;
    return matchSearch && matchLiga && matchClub && matchCat;
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
          value={filterLiga}
          onChange={(e) => { setFilterLiga(e.target.value); setFilterClub(""); }}
          className="bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8] transition-colors"
        >
          <option value="">Todas las ligas</option>
          {ligas.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
        </select>
        <select
          value={filterClub}
          onChange={(e) => setFilterClub(e.target.value)}
          className="bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8] transition-colors"
        >
          <option value="">Todos los clubes</option>
          {clubesFiltrados.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#38bdf8] transition-colors"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        {(search || filterLiga || filterClub || filterCat) && (
          <button
            onClick={() => { setSearch(""); setFilterLiga(""); setFilterClub(""); setFilterCat(""); }}
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
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider w-16"></th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Club</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Categoría</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">Precio</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Destacado</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Activo</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]/50">
                  <td className="px-4 py-2"><div className="w-14 h-[72px] rounded-md bg-[#1e1e1e] animate-pulse" /></td>
                  <td className="px-4 py-2"><div className="h-3 w-36 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-4 py-2"><div className="h-3 w-24 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-4 py-2"><div className="h-3 w-16 bg-[#1e1e1e] rounded animate-pulse" /></td>
                  <td className="px-4 py-2"><div className="h-3 w-16 bg-[#1e1e1e] rounded animate-pulse ml-auto" /></td>
                  <td className="px-4 py-2"><div className="h-3 w-10 bg-[#1e1e1e] rounded animate-pulse mx-auto" /></td>
                  <td className="px-4 py-2"><div className="h-5 w-9 bg-[#1e1e1e] rounded-full animate-pulse mx-auto" /></td>
                  <td className="px-4 py-2"><div className="h-5 w-9 bg-[#1e1e1e] rounded-full animate-pulse mx-auto" /></td>
                  <td className="px-4 py-2"></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9}>
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
                {filtered.map((p, i) => {
                  const totalStock = (p.variants ?? []).reduce((s, v) => s + v.stock, 0);
                  const variantesConStock = (p.variants ?? []).filter((v) => v.stock > 0);
                  const imgUrl = p.images?.find((img) => img.esPrincipal)?.url ?? p.images?.[0]?.url;
                  const offer = getActiveOffer(p.offers ?? []);
                  const finalPrice = offer
                    ? offer.tipo === "PORCENTAJE"
                      ? p.precio * (1 - offer.descuento / 100)
                      : p.precio - offer.descuento
                    : null;
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => openEdit(p)}
                      className={`border-b border-[#1e1e1e]/50 hover:bg-white/[0.03] transition-colors group cursor-pointer ${deletingId === p.id ? "opacity-40" : ""}`}
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-2">
                        <div className="w-14 h-[72px] rounded-md bg-[#1a1a1a] overflow-hidden border border-[#1e1e1e] flex-shrink-0">
                          {imgUrl ? (
                            <Image src={imgUrl} alt={p.nombre} width={56} height={72} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="text-gray-700" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Nombre */}
                      <td className="px-4 py-2">
                        <span className="text-white text-xs font-medium">{p.nombre}</span>
                      </td>

                      <td className="px-4 py-2 text-gray-400 text-xs">{p.club?.nombre}</td>
                      <td className="px-4 py-2 text-gray-400 text-xs">{p.categoria?.nombre}</td>

                      {/* Precio */}
                      <td className="px-4 py-2 text-right tabular-nums">
                        {offer && finalPrice !== null ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs font-semibold text-[#38bdf8]">
                              ${Math.round(finalPrice).toLocaleString("es-AR")}
                            </span>
                            <span className="text-[10px] text-gray-600 line-through leading-none">
                              ${p.precio.toLocaleString("es-AR")}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#38bdf8]/70">
                              {offer.tipo === "PORCENTAJE" ? `-${offer.descuento}%` : `-$${offer.descuento.toLocaleString("es-AR")}`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white text-xs font-medium">
                            ${p.precio.toLocaleString("es-AR")}
                          </span>
                        )}
                      </td>

                      {/* Stock con tooltip */}
                      <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block group/stock">
                          <span className={`text-xs font-semibold tabular-nums ${totalStock === 0 ? "text-gray-600" : totalStock < 5 ? "text-amber-400" : "text-emerald-400"}`}>
                            {totalStock}
                          </span>
                          {variantesConStock.length > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 hidden group-hover/stock:block">
                              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 shadow-xl min-w-max">
                                <div className="flex gap-2">
                                  {variantesConStock.map((v) => (
                                    <div key={v.talla} className="flex flex-col items-center gap-0.5">
                                      <span className="text-[10px] text-gray-500 font-medium uppercase">{v.talla}</span>
                                      <span className="text-xs text-white font-bold">{v.stock}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="w-2 h-2 bg-[#1a1a1a] border-r border-b border-[#2a2a2a] rotate-45 mx-auto -mt-1" />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Destacado */}
                      <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <ToggleSwitch
                          checked={p.destacado}
                          onChange={() => handleToggle(p, "destacado")}
                          disabled={savingId === p.id}
                        />
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <ToggleSwitch
                          checked={p.activo}
                          onChange={() => handleToggle(p, "activo")}
                          disabled={savingId === p.id}
                        />
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-gray-700 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar"
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
                value={form.categoriaId}
                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
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

          {/* Variants / Stock por talle */}
          <div>
            <label className={labelCls}>Stock por talle</label>
            <div className="grid grid-cols-7 gap-2">
              {variantEntries.map((v) => (
                <div key={v.talla} className="flex flex-col items-center gap-1">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${v.stock > 0 ? "text-[#38bdf8]" : "text-gray-600"}`}>
                    {v.talla}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={v.stock === 0 ? "" : v.stock}
                    onChange={(e) => updateVariantStock(v.talla, Math.max(0, Number(e.target.value || 0)))}
                    placeholder="0"
                    className={`w-full text-center bg-[#0a0a0a] border rounded px-1 py-1.5 text-xs text-white focus:outline-none transition-colors ${
                      v.stock > 0 ? "border-[#38bdf8]/50 focus:border-[#38bdf8]" : "border-[#1e1e1e] focus:border-[#38bdf8]"
                    }`}
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5">
              {variantEntries.filter((v) => v.stock > 0).length} talle(s) con stock
            </p>
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
