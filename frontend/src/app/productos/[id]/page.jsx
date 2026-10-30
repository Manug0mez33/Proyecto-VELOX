// Server Component: Ruta dinámica (/productos/[id] - R1) que obtiene el calzado en el servidor según su ID numérico, optimizando el SEO y First Contentful Paint, e hidrata únicamente la isla interactiva ProductDetailClient para el selector de variantes SKU y reseñas.

import { notFound } from "next/navigation";
import Link from "next/link";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { api } from "../../../lib/api";

const MOCK_DETALLES = {
  1: {
    id: 1,
    nombre: "VELOX AERO NITRO ELITE",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 1, nombre: "Running & Maratón" },
    genero: "UNISEX PRO",
    precio_base: "189500.00",
    sku_referencia: "VLX-AER-41-NEO",
    descripcion:
      "Diseñado para velocistas y fondistas de élite. Integra placa longitudinal de fibra de carbono aeroespacial de 12 capas y espuma Nitro-Foam inyectada con nitrógeno presurizado.",
    variantes: [
      { id: 101, sku: "VLX-AER-39-NEO", talle: "39", stock: 2, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 102, sku: "VLX-AER-40-NEO", talle: "40", stock: 4, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 103, sku: "VLX-AER-41-NEO", talle: "41", stock: 5, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 104, sku: "VLX-AER-42-NEO", talle: "42", stock: 3, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 105, sku: "VLX-AER-41-BLK", talle: "41", stock: 2, color: "Titanio", color_hex: "#2E2E2E" },
    ],
  },
  2: {
    id: 2,
    nombre: "VELOX VORTEX PRO X2",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 1, nombre: "Maratón" },
    genero: "UNISEX PRO",
    precio_base: "214000.00",
    sku_referencia: "VLX-VOR-42",
    descripcion:
      "Doble cámara de nitrógeno inyectado y tracción reactiva en pista mojada. El calzado ideal para distancias de 21K y 42K con agarre en curvas cerradas.",
    variantes: [
      { id: 201, sku: "VLX-VOR-40-NEO", talle: "40", stock: 1, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 202, sku: "VLX-VOR-41-NEO", talle: "41", stock: 3, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 203, sku: "VLX-VOR-42-NEO", talle: "42", stock: 4, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 204, sku: "VLX-VOR-42-BLK", talle: "42", stock: 2, color: "Carbón", color_hex: "#121212" },
    ],
  },
  3: {
    id: 3,
    nombre: "VELOX TERRA GRIP GT",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 4, nombre: "Trail" },
    genero: "HOMBRE",
    precio_base: "198000.00",
    sku_referencia: "VLX-TER-43",
    descripcion:
      "Tacos multidireccionales de 5mm y membrana hidrofóbica para terrenos irregulares, barro y senderos de alta montaña.",
    variantes: [
      { id: 301, sku: "VLX-TER-41-GRY", talle: "41", stock: 1, color: "Titanio", color_hex: "#2E2E2E" },
      { id: 302, sku: "VLX-TER-42-GRY", talle: "42", stock: 1, color: "Titanio", color_hex: "#2E2E2E" },
      { id: 303, sku: "VLX-TER-43-GRY", talle: "43", stock: 1, color: "Titanio", color_hex: "#2E2E2E" },
    ],
  },
};

async function getProducto(id) {
  try {
    const data = await api.get(`/productos/${id}/`, {
      next: { revalidate: 30 },
    });
    if (data && data.id) {
      return data;
    }
  } catch (error) {
    // Si la API falla, recurrimos al fallback por ID o generamos uno genérico
  }

  const numId = Number(id);
  if (MOCK_DETALLES[numId]) {
    return MOCK_DETALLES[numId];
  }

  // Generador dinámico para cualquier ID entre 1 y 12
  if (numId >= 1 && numId <= 12) {
    return {
      id: numId,
      nombre: `VELOX PERFORMANCE PRO SERIES #${numId}`,
      marca_detalle: { id: 5, nombre: "VELOX Performance" },
      categoria_detalle: { id: 1, nombre: "Competición" },
      genero: "UNISEX",
      precio_base: String(180000 + numId * 7500),
      sku_referencia: `VLX-SERIES-0${numId}`,
      descripcion:
        "Calzado deportivo de alta gama con chasis reforzado de fibra de carbono y suela biomecánica de retorno reactivo.",
      variantes: [
        { id: numId * 10 + 1, sku: `VLX-PRO-${numId}-40`, talle: "40", stock: 3, color: "Verde Neón", color_hex: "#39FF14" },
        { id: numId * 10 + 2, sku: `VLX-PRO-${numId}-41`, talle: "41", stock: 6, color: "Verde Neón", color_hex: "#39FF14" },
        { id: numId * 10 + 3, sku: `VLX-PRO-${numId}-42`, talle: "42", stock: 5, color: "Verde Neón", color_hex: "#39FF14" },
        { id: numId * 10 + 4, sku: `VLX-PRO-${numId}-43`, talle: "43", stock: 2, color: "Carbón", color_hex: "#121212" },
      ],
    };
  }

  return null;
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
