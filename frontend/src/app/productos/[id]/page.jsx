// Server Component: Ruta dinámica (/productos/[id] - R1) que obtiene el calzado en el servidor según su ID numérico, optimizando el SEO y First Contentful Paint, e hidrata únicamente la isla interactiva ProductDetailClient para el selector de variantes SKU y reseñas.

import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { api } from "../../../lib/api";
import { getMockProductoById } from "../../../lib/mockCatalog";

async function getProducto(id) {
  try {
    const data = await api.get(`/productos/${id}/`, {
      next: { revalidate: 30 },
    });
    if (data && data.id) {
      return data;
    }
  } catch {
    // Si la API falla, recurrimos al catálogo de contingencia centralizado por ID
  }

  return getMockProductoById(id);
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
