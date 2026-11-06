// Server Component: Ruta dinámica (/productos/[id] - R1) que obtiene el calzado en el servidor según su ID numérico, optimizando el SEO y First Contentful Paint, e hidrata únicamente la isla interactiva ProductDetailClient para el selector de variantes SKU y reseñas.

import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { api, ApiError } from "../../../lib/api";

// Solo un 404 de la API se trata como "producto inexistente"; cualquier otro error
// (API caída, 500) se propaga al error boundary (app/error.jsx).
async function getProducto(id) {
  try {
    return await api.get(`/productos/${id}/`, { next: { revalidate: 30 } });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const producto = await getProducto(id);

  if (!producto) {
    return {
      title: "Calzado no encontrado | VELOX",
    };
  }

  return {
    title: `${producto.nombre} | VELOX Performance`,
    description: producto.descripcion,
  };
}

export default async function ProductoDetallePage({ params }) {
  const { id } = await params;
  const producto = await getProducto(id);

  if (!producto) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10 space-y-8">
      {/* Migas de pan de navegación */}
      <nav aria-label="Breadcrumb" className="text-xs text-[#9CA3AF] flex items-center gap-2">
        <Link href="/" className="hover:text-[#FFFFFF] transition-colors">
          INICIO
        </Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-[#FFFFFF] transition-colors">
          CATÁLOGO
        </Link>
        <span>/</span>
        <span className="text-[#39FF14] font-semibold">{producto.nombre}</span>
      </nav>

      {/* Ficha interactiva de selección de variante, stock y compra */}
      <ProductDetailClient producto={producto} />
    </div>
  );
}
