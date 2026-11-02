// Server Component: Barra de controles de paginación declarativa que construye enlaces preservando los query parameters de búsqueda y filtrado sin hidratar JavaScript en el cliente.

import Link from "next/link";

export default function PaginationControls({
  currentPage = 1,
  totalPages = 1,
  searchParams = {},
  basePath = "/productos",
}) {
  if (totalPages <= 1) return null;

  const buildPageUrl = (pageNumber) => {
    const params = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v && k !== "page") params.set(k, v);
      });
    }
    params.set("page", String(pageNumber));
    return `${basePath}?${params.toString()}`;
  };

  return (
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
  );
}
