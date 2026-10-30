"use client";
// Client Component ("use client"): Maneja los estados controlados de búsqueda y filtrado de catálogo (marca, categoría, género, talle, orden) y sincroniza los query params con useRouter y useSearchParams para consultar la API de DRF.

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Button from "./Button";

const TALLES_RAPIDOS = ["39", "40", "41", "42", "43", "44"];

export default function FilterBar({ marcas = [], categorias = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estados locales inicializados desde los query params de la URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [marca, setMarca] = useState(searchParams.get("marca") || "");
  const [categoria, setCategoria] = useState(searchParams.get("categoria") || "");
  const [genero, setGenero] = useState(searchParams.get("genero") || "");
  const [talle, setTalle] = useState(searchParams.get("talle") || "");
  const [ordering, setOrdering] = useState(searchParams.get("ordering") || "");

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (marca) params.set("marca", marca);
    if (categoria) params.set("categoria", categoria);
    if (genero) params.set("genero", genero);
    if (talle) params.set("talle", talle);
    if (ordering) params.set("ordering", ordering);

    // Siempre resetear a la primera página al aplicar nuevos filtros
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setMarca("");
    setCategoria("");
    setGenero("");
    setTalle("");
    setOrdering("");

    startTransition(() => {
      router.push(pathname);
    });
  };

  const handleTalleToggle = (t) => {
    const nuevoTalle = talle === t ? "" : t;
    setTalle(nuevoTalle);

    const params = new URLSearchParams(searchParams.toString());
    if (nuevoTalle) {
      params.set("talle", nuevoTalle);
    } else {
      params.delete("talle");
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const hayFiltrosActivos = Boolean(
    search || marca || categoria || genero || talle || ordering
  );

  return (
    <section
      className="w-full rounded-lg bg-[#2A2A2A] border border-[#383838] p-5 shadow-lg"
      aria-label="Barra de filtros de catálogo"
    >
      <form onSubmit={handleApplyFilters} className="space-y-4">
        {/* Fila Principal de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          {/* Búsqueda por texto libre */}
          <div className="lg:col-span-4">
            <label
              htmlFor="filter-search"
              className="block text-[10px] font-bold uppercase tracking-wider text-[#39FF14] mb-1"
            >
              BÚSQUEDA
            </label>
            <div className="relative">
              <input
                id="filter-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, descripción o SKU..."
                className="w-full h-11 rounded-md bg-[#121212] border border-[#3F3F3F] px-3.5 text-xs text-[#FFFFFF] placeholder-[#777777] focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#FFFFFF]"
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Selector de Categoría */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-categoria"
              className="block text-[10px] font-bold uppercase tracking-wider text-[#39FF14] mb-1"
            >
              CATEGORÍA
            </label>
            <select
              id="filter-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full h-11 rounded-md bg-[#121212] border border-[#3F3F3F] px-3 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#39FF14] transition-colors"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id || c.nombre} value={c.nombre || c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Marca */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-marca"
              className="block text-[10px] font-bold uppercase tracking-wider text-[#39FF14] mb-1"
            >
              MARCA
            </label>
            <select
              id="filter-marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full h-11 rounded-md bg-[#121212] border border-[#3F3F3F] px-3 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#39FF14] transition-colors"
            >
              <option value="">Todas las marcas</option>
              {marcas.map((m) => (
                <option key={m.id || m.nombre} value={m.nombre || m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Género */}
          <div className="lg:col-span-2">
            <label
              htmlFor="filter-genero"
              className="block text-[10px] font-bold uppercase tracking-wider text-[#39FF14] mb-1"
            >
              GÉNERO
            </label>
            <select
              id="filter-genero"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="w-full h-11 rounded-md bg-[#121212] border border-[#3F3F3F] px-3 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#39FF14] transition-colors"
            >
              <option value="">Cualquier género</option>
              <option value="UNISEX">Unisex Pro</option>
              <option value="HOMBRE">Hombre</option>
              <option value="MUJER">Mujer</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="lg:col-span-2 flex items-end gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="flex-1 h-11 text-xs py-0"
            >
              {isPending ? "FILTRANDO..." : "FILTRAR"}
            </Button>

            {hayFiltrosActivos && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleResetFilters}
                className="h-11 px-3 text-xs py-0"
                aria-label="Limpiar filtros"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Fila Secundaria: Filtro Rápido de Talles y Orden */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#343434] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-[11px] font-bold uppercase text-[#D1D5DB] mr-1">
              TALLES AR:
            </span>
            {TALLES_RAPIDOS.map((t) => {
              const activo = talle === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTalleToggle(t)}
                  className={`inline-flex h-7 min-w-[32px] items-center justify-center rounded px-2 font-heading text-xs font-bold transition-all ${
                    activo
                      ? "bg-[#39FF14] text-[#121212] shadow-[0_0_8px_rgba(57,255,20,0.5)]"
                      : "bg-[#121212] text-[#D1D5DB] border border-[#383838] hover:border-[#39FF14]"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-ordering"
              className="font-heading text-[11px] font-bold uppercase text-[#D1D5DB]"
            >
              ORDEN:
            </label>
            <select
              id="filter-ordering"
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set("ordering", e.target.value);
                } else {
                  params.delete("ordering");
                }
                params.set("page", "1");
                startTransition(() => {
                  router.push(`${pathname}?${params.toString()}`);
                });
              }}
              className="h-8 rounded bg-[#121212] border border-[#3F3F3F] px-2 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#39FF14]"
            >
              <option value="">Destacados / Recientes</option>
              <option value="precio_base">Precio: Menor a Mayor</option>
              <option value="-precio_base">Precio: Mayor a Menor</option>
              <option value="nombre">Alfabético: A-Z</option>
            </select>
          </div>
        </div>
      </form>
    </section>
  );
}
