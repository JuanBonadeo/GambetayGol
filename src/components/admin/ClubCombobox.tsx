"use client";

import { useEffect, useRef, useState } from "react";

interface Club { id: string; nombre: string; ligaId: string; }
interface Liga { id: string; nombre: string; }

interface Props {
  value: string;
  onChange: (id: string) => void;
  clubs: Club[];
  ligas: Liga[];
  onClubCreated: (club: Club) => void;
}

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

function normalize(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const inputCls = "w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#38bdf8] transition-colors";
const labelCls = "block text-xs text-gray-500 mb-1 font-medium";

export function ClubCombobox({ value, onChange, clubs, ligas, onClubCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ nombre: "", slug: "", ligaId: "" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = clubs.find((c) => c.id === value);

  // Click outside closes dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowAdd(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = clubs.filter((c) =>
    normalize(c.nombre).includes(normalize(search))
  );

  function handleOpen() {
    setOpen(true);
    setShowAdd(false);
    setSearch("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSelect(club: Club) {
    onChange(club.id);
    setOpen(false);
    setSearch("");
  }

  function handleAddNombre(nombre: string) {
    setAddForm((f) => ({ ...f, nombre, slug: toSlug(nombre) }));
  }

  async function handleAddSubmit() {
    if (!addForm.nombre.trim() || !addForm.ligaId) {
      setAddError("Completá nombre y liga");
      return;
    }
    setAddError("");
    setAddLoading(true);
    const res = await fetch("/api/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    setAddLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setAddError(body.details ? JSON.stringify(body.details) : "Error al crear club");
      return;
    }
    const { data: newClub } = await res.json();
    onClubCreated(newClub);
    onChange(newClub.id);
    setOpen(false);
    setShowAdd(false);
    setSearch("");
    setAddForm({ nombre: "", slug: "", ligaId: "" });
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger input */}
      <div
        className={`flex items-center gap-2 w-full bg-[#0a0a0a] border rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${open ? "border-[#38bdf8]" : "border-[#1e1e1e] hover:border-gray-600"}`}
        onClick={handleOpen}
      >
        {open ? (
          <svg className="shrink-0 text-gray-500" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ) : (
          <svg className="shrink-0 text-gray-600" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-600 text-sm min-w-0"
          placeholder={selected ? selected.nombre : "Seleccionar club..."}
          value={open ? search : (selected ? selected.nombre : "")}
          onChange={(e) => setSearch(e.target.value)}
          onClick={(e) => { e.stopPropagation(); if (!open) handleOpen(); }}
          readOnly={!open}
        />
        {value && !open && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="shrink-0 text-gray-600 hover:text-gray-400 transition-colors"
            title="Limpiar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Hidden required input for form validation */}
      <input type="text" required value={value} onChange={() => {}} className="sr-only" tabIndex={-1} />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#111] border border-[#1e1e1e] rounded-lg shadow-xl overflow-hidden">
          {showAdd ? (
            /* Mini create-club form */
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => { setShowAdd(false); setAddError(""); setAddForm({ nombre: "", slug: "", ligaId: "" }); }}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <span className="text-xs font-semibold text-white">Nuevo club</span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input
                    autoFocus
                    className={inputCls}
                    value={addForm.nombre}
                    onChange={(e) => handleAddNombre(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSubmit(); } }}
                    placeholder="Ej: River Plate"
                  />
                </div>
                <div>
                  <label className={labelCls}>Liga</label>
                  <select
                    className={inputCls}
                    value={addForm.ligaId}
                    onChange={(e) => setAddForm((f) => ({ ...f, ligaId: e.target.value }))}
                  >
                    <option value="">Seleccionar liga...</option>
                    {ligas.map((l) => (
                      <option key={l.id} value={l.id}>{l.nombre}</option>
                    ))}
                  </select>
                </div>
                {addError && (
                  <p className="text-xs text-red-400">{addError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddSubmit}
                    disabled={addLoading}
                    className="flex-1 bg-[#38bdf8] text-black text-xs font-semibold py-2 rounded-lg hover:bg-[#7dd3fc] disabled:opacity-50 transition-colors"
                  >
                    {addLoading ? "Creando..." : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAdd(false); setAddError(""); setAddForm({ nombre: "", slug: "", ligaId: "" }); }}
                    className="px-3 py-2 text-xs text-gray-400 border border-[#1e1e1e] rounded-lg hover:text-white hover:border-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Club list */}
              <ul className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-3 py-3 text-xs text-gray-500 text-center">Sin resultados</li>
                ) : (
                  filtered.map((club) => (
                    <li key={club.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(club)}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                          club.id === value
                            ? "text-[#38bdf8] bg-[#38bdf8]/10"
                            : "text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        {club.nombre}
                      </button>
                    </li>
                  ))
                )}
              </ul>
              {/* Add new club button */}
              <div className="border-t border-[#1e1e1e]">
                <button
                  type="button"
                  onClick={() => { setShowAdd(true); setAddForm({ nombre: search, slug: toSlug(search), ligaId: "" }); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[#38bdf8] hover:bg-[#38bdf8]/10 transition-colors font-medium"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Nuevo club
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
