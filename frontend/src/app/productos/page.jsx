// Server Component: Página de catálogo (/productos) que resuelve searchParams en el servidor y consume el sobre paginado de DRF ({ count, next, previous, results }) enviando HTML optimizado al navegador.

import Link from "next/link";
import FilterBar from "../../components/FilterBar";
import ProductCard from "../../components/ProductCard";
import Badge from "../../components/Badge";
import PaginationControls from "../../components/PaginationControls";
import { api } from "../../lib/api";
import {
  MOCK_PRODUCTOS_CATALOGO,
  MOCK_MARCAS,
  MOCK_CATEGORIAS,
} from "../../lib/mockCatalog";

export const metadata = {
  title: "Catálogo de Alto Rendimiento | VELOX",
  description:
    "Catálogo oficial de calzado deportivo VELOX: placas de carbono, amortiguación Nitro-Foam y variantes SKU con disponibilidad en tiempo real.",
};

// Debe coincidir con PaginacionCatalogo del backend (se envía como page_size).
const ITEMS_PER_PAGE = 6;

async function getCatalogo(params = {}) {
  try {
    // Un resultado vacío (ej. un filtro sin coincidencias) es una respuesta válida:
    // se muestra tal cual y no se reemplaza por el catálogo de ejemplo.
    return await api.getPaginated("/productos/", {
      params: { ...params, page_size: ITEMS_PER_PAGE },
      next: { revalidate: 30 },
    });
  } catch {
    // Solo si la API no responde (o la página pedida no existe) se usa el catálogo local
  }

  // Filtrado en memoria sobre el mock centralizado
  let filtered = [...MOCK_PRODUCTOS_CATALOGO];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q) ||
        p.sku_referencia?.toLowerCase().includes(q) ||
        p.variantes?.some((v) => v.sku?.toLowerCase().includes(q))
    );
  }

  if (params.marca) {
    filtered = filtered.filter(
      (p) =>
        p.marca_detalle?.nombre?.toLowerCase() === params.marca.toLowerCase() ||
        String(p.marca_detalle?.id) === String(params.marca)
    );
  }

  if (params.categoria) {
    filtered = filtered.filter(
      (p) =>
        p.categoria_detalle?.nombre?.toLowerCase() ===
          params.categoria.toLowerCase() ||
        String(p.categoria_detalle?.id) === String(params.categoria)
    );
  }

  if (params.genero) {
    filtered = filtered.filter((p) => p.genero === params.genero);
  }

  if (params.talle) {
    filtered = filtered.filter((p) =>
      p.variantes?.some((v) => String(v.talle) === String(params.talle))
    );
  }

  if (params.ordering === "precio_base") {
    filtered.sort((a, b) => Number(a.precio_base) - Number(b.precio_base));
  } else if (params.ordering === "-precio_base") {
    filtered.sort((a, b) => Number(b.precio_base) - Number(a.precio_base));
  } else if (params.ordering === "nombre") {
    filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  const page = Math.max(1, Number(params.page) || 1);
  const total = filtered.length;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const pageResults = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return {
    count: total,
    next: startIndex + ITEMS_PER_PAGE < total ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results: pageResults,
  };
}

export default async function CatalogoPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page) || 1);

  const paginatedData = await getCatalogo(resolvedSearchParams || {});
  const productos = paginatedData.results || [];
  const totalCount = paginatedData.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10 space-y-10">
      {/* Encabezado del Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div className="space-y-2">
          <Badge variant="outline">TIENDA OFICIAL VELOX</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#FFFFFF]">
            CATÁLOGO DE ALTO RENDIMIENTO
          </h1>
          <p className="text-sm text-[#D1D5DB] max-w-2xl">
            Calzado deportivo propulsivo de alta gama con placa de fibra de carbono,
            amortiguación reactiva y disponibilidad por talle en tiempo real.
          </p>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#39FF14]">
            MOSTRANDO {productos.length} DE {totalCount} RESULTADOS (PÁG.{" "}
            {currentPage} DE {totalPages})
          </span>
        </div>
      </div>

      {/* Barra de Filtros Interactiva */}
      <FilterBar marcas={MOCK_MARCAS} categorias={MOCK_CATEGORIAS} />

      {/* Grilla de Productos */}
      {productos.length > 0 ? (
        <section
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          aria-label="Listado de calzados"
        >
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </section>
      ) : (
        <div className="rounded-xl bg-[#2A2A2A] border border-[#383838] p-12 text-center space-y-4">
          <p className="font-heading text-2xl font-bold uppercase text-[#FFFFFF]">
            NO SE ENCONTRARON MODELOS CON ESOS FILTROS
          </p>
          <p className="text-sm text-[#D1D5DB] max-w-md mx-auto">
            Probá ajustando la búsqueda, seleccionando otra categoría o limpiando
            los filtros aplicados.
          </p>
          <div className="pt-2">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center rounded-lg bg-[#39FF14] px-6 py-2.5 text-xs font-extrabold uppercase text-[#121212] tracking-wider hover:brightness-110"
            >
              VER TODOS LOS PRODUCTOS →
            </Link>
          </div>
        </div>
      )}

      {/* Barra de Paginación Reutilizable */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        searchParams={resolvedSearchParams}
      />
    </div>
  );
}
