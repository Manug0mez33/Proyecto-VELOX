// Server Component: Página de catálogo (/productos - R1) que lee searchParams en el servidor, consulta el endpoint paginado de DRF procesando la estructura { count, next, previous, results } y renderiza ProductCard y FilterBar sin sobrecargar el bundle JS del cliente.

import Link from "next/link";
import FilterBar from "../../components/FilterBar";
import ProductCard from "../../components/ProductCard";
import Badge from "../../components/Badge";
import { api } from "../../lib/api";

export const metadata = {
  title: "Catálogo de Alto Rendimiento | VELOX",
  description:
    "Catálogo oficial de calzado deportivo VELOX: placas de carbono, amortiguación Nitro-Foam y variantes SKU con disponibilidad en tiempo real.",
};

// Catálogo mock de contingencia (12 productos completos en 3FN con marcas, categorías y variantes SKU)
const MOCK_PRODUCTOS_CATALOGO = [
  {
    id: 1,
    nombre: "VELOX AERO NITRO ELITE",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "189500.00",
    sku_referencia: "VLX-AER-41-NEO",
    stock_total: 14,
    es_destacado: true,
    descripcion:
      "Suela de carbono propulsiva y malla ultraligera para maratón y asfalto de alta velocidad.",
    variantes: [
      { id: 101, sku: "VLX-AER-39-NEO", talle: "39", stock: 2, color: "Negro/Neón" },
      { id: 102, sku: "VLX-AER-40-NEO", talle: "40", stock: 4, color: "Negro/Neón" },
      { id: 103, sku: "VLX-AER-41-NEO", talle: "41", stock: 5, color: "Negro/Neón" },
      { id: 104, sku: "VLX-AER-42-NEO", talle: "42", stock: 3, color: "Negro/Neón" },
    ],
  },
  {
    id: 2,
    nombre: "VELOX VORTEX PRO X2",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "214000.00",
    sku_referencia: "VLX-VOR-42",
    stock_total: 8,
    es_destacado: true,
    descripcion:
      "Doble cámara de nitrógeno inyectado y agarre reactivo en pista sintética húmeda.",
    variantes: [
      { id: 201, sku: "VLX-VOR-40", talle: "40", stock: 1, color: "Titanio/Neón" },
      { id: 202, sku: "VLX-VOR-41", talle: "41", stock: 3, color: "Titanio/Neón" },
      { id: 203, sku: "VLX-VOR-42", talle: "42", stock: 4, color: "Titanio/Neón" },
    ],
  },
  {
    id: 3,
    nombre: "VELOX TERRA GRIP GT",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 4, nombre: "Trail" },
    genero: "HOMBRE",
    precio_base: "198000.00",
    sku_referencia: "VLX-TER-43",
    stock_total: 3,
    es_destacado: false,
    descripcion:
      "Tacos multidireccionales de 5mm y membrana hidrofóbica para montaña y senderos técnicos.",
    variantes: [
      { id: 301, sku: "VLX-TER-41", talle: "41", stock: 1, color: "Gris/Verde" },
      { id: 302, sku: "VLX-TER-42", talle: "42", stock: 1, color: "Gris/Verde" },
      { id: 303, sku: "VLX-TER-43", talle: "43", stock: 1, color: "Gris/Verde" },
    ],
  },
  {
    id: 4,
    nombre: "NIKE VAPORFLY 3 CARBON",
    marca_detalle: { id: 1, nombre: "Nike" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "265000.00",
    sku_referencia: "NK-VAP-42-WHT",
    stock_total: 6,
    es_destacado: false,
    descripcion:
      "Espuma ZoomX con placa de fibra de carbono completa para máxima economía de carrera.",
    variantes: [
      { id: 401, sku: "NK-VAP-41-WHT", talle: "41", stock: 2, color: "Blanco" },
      { id: 402, sku: "NK-VAP-42-WHT", talle: "42", stock: 4, color: "Blanco" },
    ],
  },
  {
    id: 5,
    nombre: "ADIDAS ADIZERO ADIOS PRO 3",
    marca_detalle: { id: 2, nombre: "Adidas" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "258000.00",
    sku_referencia: "AD-ADI-41-BLK",
    stock_total: 9,
    es_destacado: false,
    descripcion:
      "Varillas EnergyRods infusionadas con carbono para una transición anatómica y explosiva.",
    variantes: [
      { id: 501, sku: "AD-ADI-40-BLK", talle: "40", stock: 3, color: "Negro" },
      { id: 502, sku: "AD-ADI-41-BLK", talle: "41", stock: 4, color: "Negro" },
      { id: 503, sku: "AD-ADI-42-BLK", talle: "42", stock: 2, color: "Negro" },
    ],
  },
  {
    id: 6,
    nombre: "PUMA DEVIATE NITRO ELITE",
    marca_detalle: { id: 3, nombre: "Puma" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "MUJER",
    precio_base: "210000.00",
    sku_referencia: "PM-DEV-39-PNK",
    stock_total: 5,
    es_destacado: false,
    descripcion:
      "Placa INNOPLATE de carbono termoplástico con entresuela de nitrógeno superligero.",
    variantes: [
      { id: 601, sku: "PM-DEV-38-PNK", talle: "38", stock: 2, color: "Rosa Neón" },
      { id: 602, sku: "PM-DEV-39-PNK", talle: "39", stock: 3, color: "Rosa Neón" },
    ],
  },
  {
    id: 7,
    nombre: "ASICS METASPEED SKY PARIS",
    marca_detalle: { id: 4, nombre: "Asics" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "272000.00",
    sku_referencia: "AS-MET-42-RED",
    stock_total: 4,
    es_destacado: false,
    descripcion:
      "Diseñada para corredores de zancada con espuma FF Turbo Plus y placa ensanchada.",
    variantes: [
      { id: 701, sku: "AS-MET-41-RED", talle: "41", stock: 2, color: "Rojo" },
      { id: 702, sku: "AS-MET-42-RED", talle: "42", stock: 2, color: "Rojo" },
    ],
  },
  {
    id: 8,
    nombre: "VELOX STRIDE TRAINING V1",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 2, nombre: "Training" },
    genero: "HOMBRE",
    precio_base: "145000.00",
    sku_referencia: "VLX-STR-42-GRY",
    stock_total: 12,
    es_destacado: false,
    descripcion:
      "Chasis plano y base ancha para levantamientos de fuerza y entrenamientos HIIT.",
    variantes: [
      { id: 801, sku: "VLX-STR-41-GRY", talle: "41", stock: 4, color: "Gris" },
      { id: 802, sku: "VLX-STR-42-GRY", talle: "42", stock: 5, color: "Gris" },
      { id: 803, sku: "VLX-STR-43-GRY", talle: "43", stock: 3, color: "Gris" },
    ],
  },
  {
    id: 9,
    nombre: "VELOX APEX HOOPS PRO",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 3, nombre: "Básquet" },
    genero: "UNISEX",
    precio_base: "192000.00",
    sku_referencia: "VLX-APX-43-NEO",
    stock_total: 7,
    es_destacado: false,
    descripcion:
      "Botita de media caña con contrafuerte rígido y placa torsional para cambios de dirección.",
    variantes: [
      { id: 901, sku: "VLX-APX-42-NEO", talle: "42", stock: 3, color: "Negro/Neón" },
      { id: 902, sku: "VLX-APX-43-NEO", talle: "43", stock: 4, color: "Negro/Neón" },
    ],
  },
  {
    id: 10,
    nombre: "NIKE PEGASUS TRAIL 4",
    marca_detalle: { id: 1, nombre: "Nike" },
    categoria_detalle: { id: 4, nombre: "Trail" },
    genero: "HOMBRE",
    precio_base: "185000.00",
    sku_referencia: "NK-PEG-42-OLV",
    stock_total: 11,
    es_destacado: false,
    descripcion:
      "Híbrido asfalto-montaña con tracción generativa y protección contra piedras.",
    variantes: [
      { id: 1001, sku: "NK-PEG-41-OLV", talle: "41", stock: 5, color: "Verde Oliva" },
      { id: 1002, sku: "NK-PEG-42-OLV", talle: "42", stock: 6, color: "Verde Oliva" },
    ],
  },
  {
    id: 11,
    nombre: "ADIDAS DROSET POWER LIFT",
    marca_detalle: { id: 2, nombre: "Adidas" },
    categoria_detalle: { id: 2, nombre: "Training" },
    genero: "UNISEX",
    precio_base: "162000.00",
    sku_referencia: "AD-DRO-41-BLK",
    stock_total: 8,
    es_destacado: false,
    descripcion:
      "Talón reforzado de densidad firme y drop mínimo para sentadillas y potencia.",
    variantes: [
      { id: 1101, sku: "AD-DRO-40-BLK", talle: "40", stock: 3, color: "Negro" },
      { id: 1102, sku: "AD-DRO-41-BLK", talle: "41", stock: 5, color: "Negro" },
    ],
  },
  {
    id: 12,
    nombre: "VELOX HYPERION CARBON X",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "219900.00",
    sku_referencia: "VLX-HYP-42-NEO",
    stock_total: 10,
    es_destacado: true,
    descripcion:
      "El buque insignia de VELOX: drop de 8.0mm, 168 gramos y placa bicapa de fibra de carbono.",
    variantes: [
      { id: 1201, sku: "VLX-HYP-40-NEO", talle: "40", stock: 2, color: "Negro/Neón" },
      { id: 1202, sku: "VLX-HYP-41-NEO", talle: "41", stock: 3, color: "Negro/Neón" },
      { id: 1203, sku: "VLX-HYP-42-NEO", talle: "42", stock: 5, color: "Negro/Neón" },
    ],
  },
];

const MOCK_MARCAS = [
  { id: 1, nombre: "Nike" },
  { id: 2, nombre: "Adidas" },
  { id: 3, nombre: "Puma" },
  { id: 4, nombre: "Asics" },
  { id: 5, nombre: "VELOX Performance" },
];

const MOCK_CATEGORIAS = [
  { id: 1, nombre: "Running" },
  { id: 2, nombre: "Training" },
  { id: 3, nombre: "Básquet" },
  { id: 4, nombre: "Trail" },
];

const ITEMS_PER_PAGE = 6;

async function getCatalogo(params = {}) {
  try {
    const data = await api.getPaginated("/productos/", {
      params,
      next: { revalidate: 30 },
    });

    if (data && Array.isArray(data.results) && data.results.length > 0) {
      return data;
    }
  } catch (error) {
    // Si el backend no está disponible o da error de red, usamos el fallback
  }

  // Filtrado en memoria sobre el mock
  let filtered = [...MOCK_PRODUCTOS_CATALOGO];

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.sku_referencia.toLowerCase().includes(q)
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
          <Badge variant="outline">CATÁLOGO TÉCNICO • REQUISITO R1 Y R3</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#FFFFFF]">
            CATÁLOGO DE ALTO RENDIMIENTO
          </h1>
          <p className="text-sm text-[#D1D5DB] max-w-2xl">
            Calzado deportivo propulsivo conectado a la API de Django REST
            Framework con contratos en{" "}
            <code className="text-[#39FF14]">snake_case</code> y variantes SKU
            con disponibilidad exacta.
          </p>
        </div>

        <div className="text-right">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#39FF14]">
            MOSTRANDO {productos.length} DE {totalCount} RESULTADOS (PÁG.{" "}
            {currentPage} DE {totalPages})
          </span>
        </div>
      </div>

      {/* Barra de Filtros Interactiva (Client Component) */}
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

      {/* Barra de Paginación Estilo DRF ({ count, next, previous, results }) */}
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
