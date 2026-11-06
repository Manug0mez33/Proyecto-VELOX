import Link from "next/link";
import FilterBar from "../../components/FilterBar";
import ProductCard from "../../components/ProductCard";
import Badge from "../../components/Badge";
import { api, ApiError } from "../../lib/api";

export const metadata = {
  title: "Catálogo de Alto Rendimiento | VELOX",
  description:
    "Catálogo oficial de calzado deportivo VELOX: placas de carbono, amortiguación Nitro-Foam y variantes SKU con disponibilidad en tiempo real.",
};

// Debe coincidir con PaginacionCatalogo del backend (se envía como page_size).
const ITEMS_PER_PAGE = 6;

// Solo se reenvían a la API los filtros que ProductoFilter / SearchFilter / OrderingFilter entienden.
const FILTROS_API = ["search", "marca", "categoria", "genero", "ordering", "page"];

async function getCatalogo(searchParams = {}) {
  const params = { page_size: ITEMS_PER_PAGE };
  FILTROS_API.forEach((k) => {
    if (searchParams[k]) params[k] = searchParams[k];
  });

  try {
    return {
      data: await api.getPaginated("/productos/", { params, next: { revalidate: 30 } }),
      error: null,
    };
  } catch (error) {
    // 404 = página fuera de rango (ej. ?page=99 tras filtrar): se muestra como lista vacía.
    if (error instanceof ApiError && error.status === 404) {
      return { data: { count: 0, results: [] }, error: null };
    }
    return { data: { count: 0, results: [] }, error: error.message };
  }
}

// Opciones de los selectores del FilterBar, tal como están cargadas en la base.
async function getOpcionesFiltro() {
  const opciones = { next: { revalidate: 300 }, params: { page_size: 100 } };
  const [marcas, categorias] = await Promise.all([
    api.getPaginated("/marcas/", opciones).catch(() => ({ results: [] })),
    api.getPaginated("/categorias/", opciones).catch(() => ({ results: [] })),
  ]);
  return { marcas: marcas.results, categorias: categorias.results };
}

export default async function CatalogoPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, Number(resolvedSearchParams?.page) || 1);

  const [{ data: paginatedData, error: errorCatalogo }, { marcas, categorias }] =
    await Promise.all([getCatalogo(resolvedSearchParams || {}), getOpcionesFiltro()]);
  const productos = paginatedData.results || [];
  const totalCount = paginatedData.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  // Construcción de URLs de paginación preservando filtros
  const buildPageUrl = (pageNumber) => {
    const params = new URLSearchParams();
    if (resolvedSearchParams) {
      Object.entries(resolvedSearchParams).forEach(([k, v]) => {
        if (v && k !== "page") params.set(k, v);
      });
    }
    params.set("page", String(pageNumber));
    return `/productos?${params.toString()}`;
  };

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
      <FilterBar marcas={marcas} categorias={categorias} />

      {errorCatalogo && (
        <div
          role="alert"
          className="rounded-xl bg-[#2A1515] border border-[#EF4444] p-6 text-center text-sm text-[#FCA5A5]"
        >
          No se pudo cargar el catálogo: {errorCatalogo}
        </div>
      )}

      {/* Grilla de Productos */}
      {errorCatalogo ? null : productos.length > 0 ? (
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

      {/* Barra de Paginación */}
      {totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-[#2A2A2A]"
          aria-label="Paginación de catálogo"
        >
          {/* Botón Anterior */}
          {currentPage > 1 ? (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2A2A2A] border border-[#3F3F3F] px-4 font-heading text-xs font-bold text-[#FFFFFF] hover:border-[#39FF14] hover:text-[#39FF14] transition-colors"
            >
              ← Anterior
            </Link>
          ) : (
            <span className="inline-flex h-10 items-center justify-center rounded-lg bg-[#181818] px-4 font-heading text-xs font-bold text-[#555555] cursor-not-allowed">
              ← Anterior
            </span>
          )}

          {/* Botones Numéricos de Página */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isCurrent = pageNum === currentPage;
            return isCurrent ? (
              <span
                key={pageNum}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#39FF14] font-heading text-sm font-extrabold text-[#121212] shadow-[0_0_12px_rgba(57,255,20,0.4)]"
                aria-current="page"
              >
                {pageNum}
              </span>
            ) : (
              <Link
                key={pageNum}
                href={buildPageUrl(pageNum)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#2A2A2A] border border-[#3F3F3F] font-heading text-sm font-bold text-[#FFFFFF] hover:border-[#39FF14] hover:text-[#39FF14] transition-colors"
              >
                {pageNum}
              </Link>
            );
          })}

          {/* Botón Siguiente */}
          {currentPage < totalPages ? (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2A2A2A] border border-[#39FF14] px-4 font-heading text-xs font-bold text-[#39FF14] hover:bg-[#39FF14] hover:text-[#121212] transition-all"
            >
              Siguiente →
            </Link>
          ) : (
            <span className="inline-flex h-10 items-center justify-center rounded-lg bg-[#181818] px-4 font-heading text-xs font-bold text-[#555555] cursor-not-allowed">
              Siguiente →
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
