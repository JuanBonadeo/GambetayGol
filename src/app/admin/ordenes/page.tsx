"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormDrawer } from "@/components/admin/FormDrawer";
import { useToast } from "@/components/admin/Toast";
import { useConfirmDialog } from "@/components/admin/ConfirmDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = "PENDIENTE" | "CONFIRMADA" | "ENTREGADA" | "CANCELADA";
type TipoEnvio = "ROSARIO" | "ANDREANI_SUCURSAL" | "ANDREANI_DOMICILIO";

interface Variant {
  id: string;
  talla: string;
  stock: number;
  sku: string;
  product: { id: string; nombre: string; precio: number; images?: { url: string }[] };
}

interface OrderItem {
  id: string;
  variantId: string | null;
  productId: string | null;
  precio: number;
  cantidad: number;
  talla: string | null;
  esEncargo: boolean;
  variant: {
    talla: string;
    product: { nombre: string; images?: { url: string }[] };
  } | null;
  product: { nombre: string } | null;
}

interface Order {
  id: string;
  numero: number;
  status: OrderStatus;
  nombre: string;
  telefono: string | null;
  tipoEnvio: TipoEnvio;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

interface ProductForOrder {
  id: string;
  nombre: string;
  precio: number;
  variants: { id: string; talla: string; stock: number }[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<OrderStatus, { label: string; cls: string }> = {
  PENDIENTE:  { label: "Pendiente",  cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  CONFIRMADA: { label: "Confirmada", cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  ENTREGADA:  { label: "Entregada",  cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  CANCELADA:  { label: "Cancelada",  cls: "text-gray-500 bg-gray-500/10 border-gray-500/20" },
};

const TRANSITIONS: Record<OrderStatus, { status: OrderStatus; label: string; cls: string }[]> = {
  PENDIENTE: [
    { status: "CONFIRMADA", label: "Confirmar orden", cls: "bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20" },
    { status: "CANCELADA",  label: "Cancelar",        cls: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20" },
  ],
  CONFIRMADA: [
    { status: "ENTREGADA", label: "Marcar entregada", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20" },
    { status: "CANCELADA", label: "Cancelar",         cls: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20" },
  ],
  ENTREGADA: [],
  CANCELADA: [],
};

const ENVIO_LABELS: Record<TipoEnvio, string> = {
  ROSARIO:            "Rosario",
  ANDREANI_SUCURSAL:  "Andreani Sucursal",
  ANDREANI_DOMICILIO: "Andreani Domicilio",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "PENDIENTE",  label: "Pendientes" },
  { value: "CONFIRMADA", label: "Confirmadas" },
  { value: "ENTREGADA",  label: "Entregadas" },
  { value: "CANCELADA",  label: "Canceladas" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = "w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] transition-colors";
const labelCls = "block text-xs text-gray-500 mb-1 font-medium";

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, cls } = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Product picker for order form ───────────────────────────────────────────

function ProductPicker({
  productos,
  onSelect,
}: {
  productos: ProductForOrder[];
  onSelect: (p: ProductForOrder) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = productos
    .filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 12);

  return (
    <div ref={ref} className="relative flex-1">
      <input
        className={inputCls}
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-[#111] border border-[#1e1e1e] rounded-lg shadow-xl max-h-48 overflow-y-auto">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => { onSelect(p); setSearch(p.nombre); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 transition-colors flex justify-between items-center"
              >
                <span>{p.nombre}</span>
                <span className="text-gray-500 text-xs tabular-nums">${p.precio.toLocaleString("es-AR")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TALLA_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const emptyForm = { nombre: "", telefono: "", tipoEnvio: "ROSARIO" as TipoEnvio };
const emptyPending = { product: null as ProductForOrder | null, variantId: "", talla: "", cantidad: 1 };

export default function OrdenesPage() {
  const { toast } = useToast();
  const { confirm } = useConfirmDialog();

  const [ordenes, setOrdenes] = useState<Order[]>([]);
  const [productos, setProductos] = useState<ProductForOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Create / Edit form
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [orderItems, setOrderItems] = useState<{ variantId?: string; productId?: string; talla?: string; esEncargo?: boolean; precio: number; cantidad: number; label: string }[]>([]);
  const [pending, setPending] = useState(emptyPending);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Status change
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  // ── Stats
  const total = ordenes.length;
  const pendientes = ordenes.filter((o) => o.status === "PENDIENTE").length;
  const confirmadas = ordenes.filter((o) => o.status === "CONFIRMADA").length;
  const ventas = ordenes
    .filter((o) => o.status === "CONFIRMADA" || o.status === "ENTREGADA")
    .reduce((s, o) => s + o.total, 0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [oRes, pRes] = await Promise.all([
      fetch("/api/orders"),
      fetch("/api/products"),
    ]);
    const oData = (await oRes.json()).data || [];
    const pData = (await pRes.json()).data || [];
    setOrdenes(oData);
    setProductos(
      pData.map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        variants: (p.variants || []).map((v: any) => ({ id: v.id, talla: v.talla, stock: v.stock })),
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = filterStatus
    ? ordenes.filter((o) => o.status === filterStatus)
    : ordenes;

  // ── Open create drawer
  const openCreate = () => {
    setSelectedOrder(null);
    setEditMode(false);
    setForm(emptyForm);
    setOrderItems([]);
    setPending(emptyPending);
    setFormError("");
    setDrawerOpen(true);
  };

  // ── Open view drawer
  const openView = (order: Order) => {
    setSelectedOrder(order);
    setEditMode(false);
    setStatusError("");
    setDrawerOpen(true);
  };

  // ── Switch to edit mode
  const openEdit = (order: Order) => {
    setForm({ nombre: order.nombre, telefono: order.telefono ?? "", tipoEnvio: order.tipoEnvio });
    setOrderItems(
      order.items.map((i) => ({
        variantId: i.variantId ?? undefined,
        productId: i.productId ?? undefined,
        talla: i.talla ?? undefined,
        esEncargo: i.esEncargo,
        precio: i.precio,
        cantidad: i.cantidad,
        label: i.esEncargo
          ? `${i.product?.nombre ?? "—"} — ${i.talla ?? "?"} (enc.)`
          : `${i.variant?.product?.nombre ?? "—"} — ${i.variant?.talla ?? "?"}`,
      }))
    );
    setPending(emptyPending);
    setFormError("");
    setEditMode(true);
  };

  // ── Add pending item to list
  const addItem = () => {
    if (!pending.product || !pending.talla || pending.cantidad < 1) return;
    const variant = pending.product.variants.find((v) => v.talla === pending.talla);
    const esEncargo = !variant || variant.stock === 0;
    setOrderItems((prev) => [...prev,
      esEncargo
        ? { productId: pending.product!.id, talla: pending.talla, esEncargo: true, precio: pending.product!.precio, cantidad: pending.cantidad, label: `${pending.product!.nombre} — ${pending.talla} (enc.)` }
        : { variantId: variant!.id, esEncargo: false, precio: pending.product!.precio, cantidad: pending.cantidad, label: `${pending.product!.nombre} — ${pending.talla}` },
    ]);
    setPending(emptyPending);
  };

  // ── Create order
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) { setFormError("Agregá al menos un ítem"); return; }
    setFormError("");
    setFormLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        telefono: form.telefono || null,
        tipoEnvio: form.tipoEnvio,
        items: orderItems.map((i) =>
          i.esEncargo
            ? { esEncargo: true, productId: i.productId, talla: i.talla, precio: i.precio, cantidad: i.cantidad }
            : { esEncargo: false, variantId: i.variantId, precio: i.precio, cantidad: i.cantidad }
        ),
      }),
    });
    setFormLoading(false);
    if (!res.ok) {
      const body = await res.json();
      setFormError(typeof body.error === "string" ? body.error : "Error al crear");
      return;
    }
    toast("Orden creada");
    setDrawerOpen(false);
    loadData();
  };

  // ── Edit order
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (orderItems.length === 0) { setFormError("Agregá al menos un ítem"); return; }
    setFormError("");
    setFormLoading(true);
    const res = await fetch(`/api/orders/${selectedOrder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: form.nombre,
        telefono: form.telefono || null,
        tipoEnvio: form.tipoEnvio,
        items: orderItems.map((i) =>
          i.esEncargo
            ? { esEncargo: true, productId: i.productId, talla: i.talla, precio: i.precio, cantidad: i.cantidad }
            : { esEncargo: false, variantId: i.variantId, precio: i.precio, cantidad: i.cantidad }
        ),
      }),
    });
    setFormLoading(false);
    if (!res.ok) {
      const body = await res.json();
      setFormError(typeof body.error === "string" ? body.error : "Error al guardar");
      return;
    }
    const updated = (await res.json()).data;
    setSelectedOrder(updated);
    setOrdenes((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditMode(false);
    toast("Orden actualizada");
  };

  // ── Delete order
  const handleDelete = async () => {
    if (!selectedOrder) return;
    const ok = await confirm(
      `Eliminar orden #${selectedOrder.numero}`,
      "Esta acción no se puede deshacer. ¿Eliminar la orden?"
    );
    if (!ok) return;
    const res = await fetch(`/api/orders/${selectedOrder.id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json();
      toast(body.error || "Error al eliminar");
      return;
    }
    toast("Orden eliminada");
    setDrawerOpen(false);
    setOrdenes((prev) => prev.filter((o) => o.id !== selectedOrder.id));
  };

  // ── Change status
  const handleStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setStatusError("");
    setStatusLoading(true);
    const res = await fetch(`/api/orders/${selectedOrder.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatusLoading(false);
    if (!res.ok) {
      const body = await res.json();
      setStatusError(body.error || "Error al cambiar estado");
      return;
    }
    const updated = (await res.json()).data;
    setSelectedOrder(updated);
    setOrdenes((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    toast(`Orden ${STATUS_CFG[newStatus as OrderStatus].label.toLowerCase()}`);
  };

  const orderTotal = orderItems.reduce((s, i) => s + i.precio * i.cantidad, 0);


  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Ventas</h1>
          <p className="text-2xl font-bold text-white">Órdenes</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#38bdf8] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#7dd3fc] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Orden
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total órdenes", value: total, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
          { label: "Pendientes", value: pendientes, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, accent: pendientes > 0 ? "text-amber-400" : undefined },
          { label: "Confirmadas", value: confirmadas, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
          { label: "Ventas totales", value: `$${ventas.toLocaleString("es-AR")}`, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, big: true },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{s.label}</span>
              <span className="text-[#38bdf8]">{s.icon}</span>
            </div>
            {loading ? (
              <div className="h-8 w-20 bg-[#1e1e1e] rounded animate-pulse" />
            ) : (
              <span className={`font-bold text-white tabular-nums ${s.big ? "text-2xl" : "text-3xl"} ${s.accent ?? ""}`}>
                {s.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterStatus === f.value
                ? "bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30"
                : "text-gray-500 border border-[#1e1e1e] hover:text-white hover:border-gray-600"
            }`}
          >
            {f.label}
            {f.value === "PENDIENTE" && pendientes > 0 && (
              <span className="ml-1.5 bg-amber-400/20 text-amber-400 rounded px-1 text-[10px]">{pendientes}</span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e1e]">
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Envío</th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">Ítems</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]/50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 bg-[#1e1e1e] rounded animate-pulse" style={{ width: j === 4 ? "4rem" : "6rem" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <svg className="text-gray-700 mb-3" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                    <p className="text-gray-400 text-sm font-medium mb-1">Sin órdenes</p>
                    <p className="text-gray-600 text-xs">
                      {filterStatus ? "No hay órdenes con ese estado" : "Todavía no hay ninguna orden"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((o, i) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => openView(o)}
                    className="border-b border-[#1e1e1e]/50 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">#{o.numero}</td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs font-medium">{o.nombre}</p>
                      {o.telefono && <p className="text-gray-600 text-xs">{o.telefono}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{ENVIO_LABELS[o.tipoEnvio]}</td>
                    <td className="px-4 py-3 text-center text-gray-400 text-xs">
                      <span>{o.items.length}</span>
                      {o.items.some((i) => i.esEncargo) && (
                        <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          enc.
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-white text-xs font-semibold tabular-nums">
                      ${o.total.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}
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
        title={selectedOrder ? `Orden #${selectedOrder.numero}${editMode ? " — Editar" : ""}` : "Nueva orden"}
      >
        {selectedOrder && editMode ? (
          /* ── Edit order ── */
          <form onSubmit={handleEdit} className="space-y-5">
            {formError && (
              <div className="p-3 bg-red-950/50 border border-red-900/40 text-red-400 rounded-lg text-xs">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Nombre *</label>
                <input required className={inputCls} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input className={inputCls} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Opcional" />
              </div>
              <div>
                <label className={labelCls}>Tipo de envío *</label>
                <select required className={inputCls} value={form.tipoEnvio} onChange={(e) => setForm({ ...form, tipoEnvio: e.target.value as TipoEnvio })}>
                  <option value="ROSARIO">Rosario</option>
                  <option value="ANDREANI_SUCURSAL">Andreani Sucursal</option>
                  <option value="ANDREANI_DOMICILIO">Andreani Domicilio</option>
                </select>
              </div>
            </div>

            {/* Add item */}
            <div className="p-4 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg space-y-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Agregar ítem</p>
              <ProductPicker productos={productos} onSelect={(p) => setPending({ ...emptyPending, product: p })} />
              {pending.product && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {TALLA_ORDER.map((talla) => {
                      const variant = pending.product!.variants.find((v) => v.talla === talla);
                      const available = !!variant && variant.stock > 0;
                      const selected = pending.talla === talla;
                      return (
                        <div key={talla} className="flex flex-col items-center gap-1">
                          <button type="button"
                            onClick={() => setPending({ ...pending, talla, variantId: variant?.id ?? "" })}
                            className={`w-14 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all ${
                              selected && available ? "bg-[#38bdf8] text-black"
                              : selected ? "bg-[#2a2a2a] text-white border border-[#38bdf8]/40"
                              : available ? "bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                              : "bg-[#141414] text-[#444] border border-[#444]/20 hover:border-[#444]/40 hover:text-gray-400"
                            }`}
                          >{talla}</button>
                          {!available && <span className="text-[8px] font-bold uppercase tracking-widest text-[#444]">enc.</span>}
                        </div>
                      );
                    })}
                  </div>
                  {pending.talla && (
                    <div className="flex gap-2">
                      <div className="w-20">
                        <input type="number" min={1}
                          max={pending.product.variants.find((v) => v.talla === pending.talla)?.stock || 99}
                          className={inputCls} value={pending.cantidad}
                          onChange={(e) => setPending({ ...pending, cantidad: Math.max(1, Number(e.target.value)) })} />
                      </div>
                      <button type="button" onClick={addItem}
                        className="flex-1 py-2 bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 rounded-lg text-sm font-medium hover:bg-[#38bdf8]/20 transition-colors"
                      >Agregar</button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Items list */}
            {orderItems.length > 0 && (
              <div className="border border-[#1e1e1e] rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Producto</th>
                      <th className="px-3 py-2 text-center text-gray-500 font-medium">Cant.</th>
                      <th className="px-3 py-2 text-right text-gray-500 font-medium">Subtotal</th>
                      <th className="px-3 py-2 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-[#1e1e1e]/50">
                        <td className="px-3 py-2 text-white">{item.label}</td>
                        <td className="px-3 py-2 text-center text-gray-400">{item.cantidad}</td>
                        <td className="px-3 py-2 text-right text-white tabular-nums">${(item.precio * item.cantidad).toLocaleString("es-AR")}</td>
                        <td className="px-3 py-2">
                          <button type="button" onClick={() => setOrderItems((prev) => prev.filter((_, i) => i !== idx))} className="text-gray-600 hover:text-red-400 transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0a0a0a]">
                      <td colSpan={2} className="px-3 py-2 text-right text-gray-500 font-medium">Total</td>
                      <td className="px-3 py-2 text-right text-[#38bdf8] font-bold tabular-nums">
                        ${orderItems.reduce((s, i) => s + i.precio * i.cantidad, 0).toLocaleString("es-AR")}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-[#1e1e1e]">
              <button type="submit" disabled={formLoading} className="flex-1 bg-[#38bdf8] text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-[#7dd3fc] disabled:opacity-50 transition-colors">
                {formLoading ? "Guardando..." : "Guardar cambios"}
              </button>
              <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2.5 text-sm text-gray-400 border border-[#1e1e1e] rounded-lg hover:text-white hover:border-gray-600 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        ) : selectedOrder ? (
          /* ── View order ── */
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedOrder.status} />
                <span className="text-xs text-gray-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit", month: "long", year: "numeric",
                  })}
                </span>
              </div>
              {selectedOrder.status === "PENDIENTE" && (
                <button
                  type="button"
                  onClick={() => openEdit(selectedOrder)}
                  className="text-xs text-[#38bdf8] hover:text-[#7dd3fc] transition-colors"
                >
                  Editar
                </button>
              )}
            </div>

            {/* Customer */}
            <div className="p-4 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg space-y-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Cliente</p>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Nombre</span>
                <span className="text-xs text-white font-medium">{selectedOrder.nombre}</span>
              </div>
              {selectedOrder.telefono && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Teléfono</span>
                  <span className="text-xs text-white">{selectedOrder.telefono}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Envío</span>
                <span className="text-xs text-white">{ENVIO_LABELS[selectedOrder.tipoEnvio]}</span>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Ítems</p>
              <div className="border border-[#1e1e1e] rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Producto</th>
                      <th className="px-3 py-2 text-center text-gray-500 font-medium">Talle</th>
                      <th className="px-3 py-2 text-center text-gray-500 font-medium">Cant.</th>
                      <th className="px-3 py-2 text-right text-gray-500 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b border-[#1e1e1e]/50">
                        <td className="px-3 py-2 text-white">
                          <span>{item.product?.nombre ?? item.variant?.product?.nombre ?? "—"}</span>
                          {item.esEncargo && (
                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Encargo
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-400">{item.talla ?? item.variant?.talla ?? "—"}</td>
                        <td className="px-3 py-2 text-center text-gray-400">{item.cantidad}</td>
                        <td className="px-3 py-2 text-right text-white font-medium tabular-nums">
                          ${(item.precio * item.cantidad).toLocaleString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0a0a0a]">
                      <td colSpan={3} className="px-3 py-2 text-right text-gray-500 font-medium">Total</td>
                      <td className="px-3 py-2 text-right text-[#38bdf8] font-bold tabular-nums">
                        ${selectedOrder.total.toLocaleString("es-AR")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Status actions */}
            {TRANSITIONS[selectedOrder.status].length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Cambiar estado</p>
                {statusError && (
                  <p className="text-xs text-red-400 p-2 bg-red-950/40 border border-red-900/30 rounded-lg">{statusError}</p>
                )}
                <div className="flex gap-2">
                  {TRANSITIONS[selectedOrder.status].map((t) => (
                    <button
                      key={t.status}
                      type="button"
                      disabled={statusLoading}
                      onClick={() => handleStatus(t.status)}
                      className={`flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 ${t.cls}`}
                    >
                      {statusLoading ? "..." : t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Danger zone */}
            <div className="pt-2 border-t border-[#1e1e1e]">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full text-sm font-medium py-2.5 rounded-lg transition-colors bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
              >
                Eliminar orden
              </button>
            </div>
          </div>
        ) : (
          /* ── Create order ── */
          <form onSubmit={handleCreate} className="space-y-5">
            {formError && (
              <div className="p-3 bg-red-950/50 border border-red-900/40 text-red-400 rounded-lg text-xs">
                {formError}
              </div>
            )}

            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Nombre *</label>
                <input
                  required
                  className={inputCls}
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input
                  className={inputCls}
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className={labelCls}>Tipo de envío *</label>
                <select
                  required
                  className={inputCls}
                  value={form.tipoEnvio}
                  onChange={(e) => setForm({ ...form, tipoEnvio: e.target.value as TipoEnvio })}
                >
                  <option value="ROSARIO">Rosario</option>
                  <option value="ANDREANI_SUCURSAL">Andreani Sucursal</option>
                  <option value="ANDREANI_DOMICILIO">Andreani Domicilio</option>
                </select>
              </div>
            </div>

            {/* Add item */}
            <div className="p-4 bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg space-y-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Agregar ítem</p>
              <ProductPicker
                productos={productos}
                onSelect={(p) => setPending({ ...emptyPending, product: p })}
              />
              {pending.product && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {TALLA_ORDER.map((talla) => {
                      const variant = pending.product!.variants.find((v) => v.talla === talla);
                      const available = !!variant && variant.stock > 0;
                      const selected = pending.talla === talla;
                      return (
                        <div key={talla} className="flex flex-col items-center gap-1">
                          <button type="button"
                            onClick={() => setPending({ ...pending, talla, variantId: variant?.id ?? "" })}
                            className={`w-14 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all ${
                              selected && available ? "bg-[#38bdf8] text-black"
                              : selected ? "bg-[#2a2a2a] text-white border border-[#38bdf8]/40"
                              : available ? "bg-[#1e1e1e] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                              : "bg-[#141414] text-[#444] border border-[#444]/20 hover:border-[#444]/40 hover:text-gray-400"
                            }`}
                          >{talla}</button>
                          {!available && <span className="text-[8px] font-bold uppercase tracking-widest text-[#444]">enc.</span>}
                        </div>
                      );
                    })}
                  </div>
                  {pending.talla && (
                    <div className="flex gap-2">
                      <div className="w-20">
                        <input
                          type="number" min={1}
                          max={pending.product.variants.find((v) => v.talla === pending.talla)?.stock || 99}
                          className={inputCls} value={pending.cantidad}
                          onChange={(e) => setPending({ ...pending, cantidad: Math.max(1, Number(e.target.value)) })}
                        />
                      </div>
                      <button type="button" onClick={addItem}
                        className="flex-1 py-2 bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 rounded-lg text-sm font-medium hover:bg-[#38bdf8]/20 transition-colors"
                      >Agregar</button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Items list */}
            {orderItems.length > 0 && (
              <div className="border border-[#1e1e1e] rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e1e1e] bg-[#0a0a0a]">
                      <th className="px-3 py-2 text-left text-gray-500 font-medium">Producto</th>
                      <th className="px-3 py-2 text-center text-gray-500 font-medium">Cant.</th>
                      <th className="px-3 py-2 text-right text-gray-500 font-medium">Subtotal</th>
                      <th className="px-3 py-2 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-[#1e1e1e]/50">
                        <td className="px-3 py-2 text-white">{item.label}</td>
                        <td className="px-3 py-2 text-center text-gray-400">{item.cantidad}</td>
                        <td className="px-3 py-2 text-right text-white tabular-nums">
                          ${(item.precio * item.cantidad).toLocaleString("es-AR")}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => setOrderItems((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0a0a0a]">
                      <td colSpan={2} className="px-3 py-2 text-right text-gray-500 font-medium">Total</td>
                      <td className="px-3 py-2 text-right text-[#38bdf8] font-bold tabular-nums">
                        ${orderTotal.toLocaleString("es-AR")}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-[#1e1e1e]">
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 bg-[#38bdf8] text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-[#7dd3fc] disabled:opacity-50 transition-colors"
              >
                {formLoading ? "Creando..." : "Crear orden"}
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
        )}
      </FormDrawer>
    </div>
  );
}
