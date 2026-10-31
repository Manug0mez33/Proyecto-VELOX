import Link from "next/link";
import Button from "../components/Button";
import Badge from "../components/Badge";
import ProductCard from "../components/ProductCard";

const FALLBACK_DESTACADOS = [
  {
    id: 1,
    nombre: "VELOX AERO NITRO ELITE",
    marca_detalle: { nombre: "VELOX LAB" },
    categoria_detalle: { nombre: "COMPETICIÓN" },
    genero: "UNISEX",
    precio_base: "189500.00",
    sku_referencia: "VLX-AER-41-NEO",
    stock_total: 14,
    es_destacado: true,
    descripcion:
      "Suela de carbono propulsiva y malla ultraligera para récords en asfalto.",
    talles: ["39", "40", "41", "42"],
    talle_activo: "41",
    variantes: [
      { id: 101, sku: "VLX-AER-39-NEO", talle: "39", stock: 3, color: "Negro/Neón" },
      { id: 102, sku: "VLX-AER-40-NEO", talle: "40", stock: 4, color: "Negro/Neón" },
      { id: 103, sku: "VLX-AER-41-NEO", talle: "41", stock: 5, color: "Negro/Neón" },
      { id: 104, sku: "VLX-AER-42-NEO", talle: "42", stock: 2, color: "Negro/Neón" },
    ],
  },
  {
    id: 2,
    nombre: "VELOX VORTEX PRO X2",
    marca_detalle: { nombre: "VELOX LAB" },
    categoria_detalle: { nombre: "MARATÓN" },
    genero: "MARATÓN",
    precio_base: "214000.00",
    sku_referencia: "VLX-VOR-42",
    stock_total: 8,
    es_destacado: true,
    descripcion:
      "Doble cámara de nitrógeno inyectado y agarre reactivo en pista húmeda.",
    talles: ["40", "41", "42", "43"],
    talle_activo: "42",
    variantes: [
      { id: 201, sku: "VLX-VOR-40", talle: "40", stock: 1, color: "Titanio/Neón" },
      { id: 202, sku: "VLX-VOR-41", talle: "41", stock: 3, color: "Titanio/Neón" },
      { id: 203, sku: "VLX-VOR-42", talle: "42", stock: 4, color: "Titanio/Neón" },
    ],
  },
  {
    id: 3,
    nombre: "VELOX TERRA GRIP GT",
    marca_detalle: { nombre: "VELOX TRAIL" },
    categoria_detalle: { nombre: "TRAIL PRO" },
    genero: "MONTAÑA",
    precio_base: "198000.00",
    sku_referencia: "VLX-TER-43",
    stock_total: 3,
    es_destacado: false,
    descripcion:
      "Tacos multidireccionales de 5mm y membrana hidrofóbica de alta tracción.",
    talles: ["41", "42", "43", "44"],
    talle_activo: "43",
    variantes: [
      { id: 301, sku: "VLX-TER-41", talle: "41", stock: 1, color: "Gris/Verde" },
      { id: 302, sku: "VLX-TER-42", talle: "42", stock: 1, color: "Gris/Verde" },
      { id: 303, sku: "VLX-TER-43", talle: "43", stock: 1, color: "Gris/Verde" },
    ],
  },
];

async function getProductosDestacados() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return FALLBACK_DESTACADOS;

  try {
    const res = await fetch(`${apiUrl}/productos/destacados/`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return FALLBACK_DESTACADOS;
    const data = await res.json();
    const items = Array.isArray(data) ? data : data?.results;
    if (Array.isArray(items) && items.length > 0) {
      return items.slice(0, 3);
    }
    return FALLBACK_DESTACADOS;
  } catch {
    return FALLBACK_DESTACADOS;
  }
}

export default async function HomePage() {
  const destacados = await getProductosDestacados();

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10 space-y-20">
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 pt-2">
        {/* Columna Izquierda: Copywriting & CTAs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2.5 rounded-md bg-[#1D2B1A] border border-[#39FF14] px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#39FF14]" />
            <span className="font-heading text-[11px] font-bold uppercase tracking-[0.15em] text-[#39FF14]">
              SERIE CARBON PRO • 2026
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="font-heading text-4xl sm:text-6xl font-bold uppercase leading-[1.05] tracking-tight text-[#FFFFFF]">
              VELOCIDAD
              <span className="block text-[#39FF14] velox-text-glow">
                SIN FRICCIÓN.
              </span>
              <span className="block text-3xl sm:text-5xl pt-1 text-[#FFFFFF]">
                RENDIMIENTO PURO.
              </span>
            </h1>
          </div>

          <p className="max-w-xl text-base text-[#D1D5DB] leading-relaxed">
            Ingeniería biomecánica con placa de fibra de carbono de doble
            densidad. Diseñado para atletas que buscan romper su marca en cada
            pasada.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button variant="primary" href="/productos">
              EXPLORAR CATÁLOGO →
            </Button>
            <Button variant="secondary" href="/tecnologia">
              CONOCER LA TECNOLOGÍA
            </Button>
          </div>

          {/* KPIs Técnicos */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#2A2A2A] max-w-lg">
            <div>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-[#39FF14]">
                168 g
              </p>
              <p className="text-xs text-[#D1D5DB] mt-1">
                Peso ultraligero (Talle 41)
              </p>
            </div>
            <div className="border-l border-[#2A2A2A] pl-6">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
                +87%
              </p>
              <p className="text-xs text-[#D1D5DB] mt-1">
                Retorno de energía reactiva
              </p>
            </div>
            <div className="border-l border-[#2A2A2A] pl-6">
              <p className="font-heading text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
                8.0 mm
              </p>
              <p className="text-xs text-[#D1D5DB] mt-1">
                Drop aerodinámico oficial
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Showcase Zapatilla */}
        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E1E1E] to-[#141414] border border-[#2A2A2A] p-6 sm:p-8">
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-md bg-[#2A2A2A] px-3 py-1.5 font-heading text-[11px] font-bold tracking-wider text-[#39FF14]">
                REF: VLX-HYP-42-NEO
              </span>
              <Badge variant="outline">DISPONIBLE</Badge>
            </div>

            <div className="relative my-8 flex h-[240px] sm:h-[260px] items-center justify-center">
              <div
                className="pointer-events-none absolute h-44 w-80 rounded-full bg-[#39FF14]/20 blur-3xl"
                aria-hidden="true"
              />

              <div className="pointer-events-none absolute inset-x-4 top-2 border-t border-dashed border-[#2A2A2A]" />
              <div className="pointer-events-none absolute inset-x-4 bottom-2 border-t border-dashed border-[#2A2A2A]" />

              <svg
                viewBox="0 0 470 250"
                className="relative z-10 w-full max-w-[430px] drop-shadow-[0_12px_28px_rgba(57,255,20,0.22)]"
                role="img"
                aria-label="Silueta VELOX Hyperion Carbon X"
              >
                <defs>
                  <linearGradient id="shoeBody" x1="0" y1="0" x2="1" y2="0.4">
                    <stop offset="0%" stopColor="#383838" />
                    <stop offset="50%" stopColor="#1F1F1F" />
                    <stop offset="100%" stopColor="#121212" />
                  </linearGradient>
                </defs>
                <ellipse cx="230" cy="230" rx="195" ry="14" fill="#090909" />
                <path
                  d="M20 190 Q140 205 290 195 Q395 188 445 162 Q458 178 442 198 Q380 222 240 222 Q95 222 15 208 Z"
                  fill="#39FF14"
                />
                <path
                  d="M35 188 L75 95 Q115 80 155 108 L245 65 Q275 58 295 85 L385 132 Q435 142 442 162 Q345 194 185 195 Q85 195 35 188 Z"
                  fill="url(#shoeBody)"
                  stroke="#4A4A4A"
                  strokeWidth="2"
                />
                <path
                  d="M125 145 L285 115 L265 135 L110 162 Z"
                  fill="#39FF14"
                />
                <path
                  d="M175 168 L335 142 L322 156 L165 178 Z"
                  fill="#39FF14"
                  fillOpacity="0.75"
                />
                <path
                  d="M82 95 Q115 62 152 68 L175 102 Z"
                  fill="#2A2A2A"
                  stroke="#39FF14"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#FFFFFF]">
                  VELOX HYPERION CARBON X
                </h2>
                <p className="text-xs sm:text-sm text-[#D1D5DB]">
                  Categoría: Competición / Maratón • Placa Fibra de Carbono
                </p>
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-[#39FF14]">
                $219.900
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. CALZADOS DESTACADOS ==================== */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-5">
          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
              ● CALZADOS DESTACADOS
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#FFFFFF] mt-1">
              DESTACADOS DE LA SEMANA
            </h2>
            <p className="text-sm text-[#D1D5DB]">
              Modelos de competición de alto nivel con placa propulsiva y amortiguación elástica.
            </p>
          </div>
          <Link
            href="/productos"
            className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14] hover:underline"
          >
            VER CATÁLOGO COMPLETO →
          </Link>
        </div>

        {/* Grilla interactiva con selección de talles y compra directa */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {destacados.map((producto, idx) => (
            <ProductCard key={producto.id || idx} producto={producto} />
          ))}
        </div>
      </section>

      {/* ==================== 3. INNOVACIÓN BIOMECÁNICA VELOX ==================== */}
      <section className="rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] p-8 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
              INNOVACIÓN BIOMECÁNICA • SERIE PRO 2026
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#FFFFFF]">
              SISTEMA DE PROPULSIÓN REACTIVA VELOX
            </h2>
            <p className="text-sm text-[#D1D5DB] leading-relaxed">
              Cada calzado VELOX combina ingeniería biomecánica de alta precisión con materiales avanzados,
              maximizando el retorno de energía, la estabilidad torsional y la amortiguación crítica en entrenamientos y carreras de fondo.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-lg bg-[#2A2A2A] p-4">
                <p className="font-heading text-lg font-bold text-[#39FF14]">
                  01. PLACA DE CARBONO
                </p>
                <p className="mt-1 text-xs text-[#D1D5DB]">
                  Estructura anatómica que catapulta cada zancada, reduciendo la fatiga muscular y optimizando el ritmo de carrera.
                </p>
              </div>
              <div className="rounded-lg bg-[#2A2A2A] p-4">
                <p className="font-heading text-lg font-bold text-[#39FF14]">
                  02. ESPUMA NITRO-FOAM
                </p>
                <p className="mt-1 text-xs text-[#D1D5DB]">
                  Compuesto ultraligero con nitrógeno inyectado para un 87% de retorno de energía elástica constante.
                </p>
              </div>
              <div className="rounded-lg bg-[#2A2A2A] p-4">
                <p className="font-heading text-lg font-bold text-[#39FF14]">
                  03. SUELA MATRIX-GRIP
                </p>
                <p className="mt-1 text-xs text-[#D1D5DB]">
                  Diseño de tracción multidireccional con agarre superior tanto en asfalto húmedo como en pista sintética.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between rounded-lg bg-[#2A2A2A] border border-[#39FF14]/40 p-6 space-y-5">
            <div>
              <Badge variant="neon">LABORATORIO VELOX</Badge>
              <h3 className="mt-3 font-heading text-xl font-bold text-[#FFFFFF]">
                INGENIERÍA DE RENDIMIENTO
              </h3>
              <p className="mt-2 text-xs text-[#D1D5DB] leading-relaxed">
                Descubrí cómo diseñamos calzado para deportistas de alto nivel y conocé nuestra filosofía de desarrollo.
              </p>
            </div>
            <Button variant="primary" href="/tecnologia" className="w-full">
              EXPLORAR TECNOLOGÍA →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
