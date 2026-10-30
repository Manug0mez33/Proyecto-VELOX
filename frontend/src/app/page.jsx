// Server Component: Landing page principal (/) de VELOX que consulta GET /api/productos/destacados/ desde el servidor con fallback seguro para optimizar SEO y First Contentful Paint (FCP).

import Link from "next/link";
import Button from "../components/Button";
import Badge from "../components/Badge";

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
    es_destacado: false,
    descripcion:
      "Suela de carbono propulsiva y malla ultraligera para récords en asfalto.",
    talles: ["39", "40", "41", "42"],
    talle_activo: "41",
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

function formatPrecioARS(valor) {
  const numero = Number(valor) || 0;
  return `$${numero.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export default async function HomePage() {
  const destacados = await getProductosDestacados();

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10 space-y-20">
      {/* ==================== 1. HERO SECTION (Frame 01 Figma) ==================== */}
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

          {/* CTAs con Tono de Voz VELOX */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button variant="primary" href="/productos">
              ACELERAR AHORA →
            </Button>
            <Button variant="secondary" href="/tecnologia">
              ANALIZAR RENDIMIENTO
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

        {/* Columna Derecha: Showcase Zapatilla con Glow Verde Neón */}
        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E1E1E] to-[#141414] border border-[#2A2A2A] p-6 sm:p-8">
            {/* Top Spec Badges */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-md bg-[#2A2A2A] px-3 py-1.5 font-heading text-[11px] font-bold tracking-wider text-[#39FF14]">
                SKU: VLX-HYP-42-NEO
              </span>
              <Badge variant="outline">STOCK ACTIVO</Badge>
            </div>

            {/* Glow sutil verde neón detrás del render del calzado (Manual de Marca pág. 3) */}
            <div className="relative my-8 flex h-[240px] sm:h-[260px] items-center justify-center">
              <div
                className="pointer-events-none absolute h-44 w-80 rounded-full bg-[#39FF14]/20 blur-3xl"
                aria-hidden="true"
              />

              {/* Líneas técnicas de telemetría */}
              <div className="pointer-events-none absolute inset-x-4 top-2 border-t border-dashed border-[#2A2A2A]" />
              <div className="pointer-events-none absolute inset-x-4 bottom-2 border-t border-dashed border-[#2A2A2A]" />

              {/* Silueta Vectorial VELOX Hyperion Carbon X (idéntica a Figma) */}
              <svg
                viewBox="0 0 470 250"
                className="relative z-10 w-full max-w-[430px] drop-shadow-[0_12px_28px_rgba(57,255,20,0.22)]"
                role="img"
                aria-label="Render técnico VELOX Hyperion Carbon X"
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

            {/* Pie del Hero Card */}
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

      {/* ==================== 2. CALZADOS DESTACADOS (@action GET /api/productos/destacados/) ==================== */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-5">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#39FF14]">
              ● @action: GET /api/productos/destacados/
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#FFFFFF] mt-1">
              DESTACADOS DE LA SEMANA
            </h2>
            <p className="text-sm text-[#D1D5DB]">
              Modelos de competición servidos por ProductoViewSet con variantes
              SKU y stock en tiempo real.
            </p>
          </div>
          <Link
            href="/productos"
            className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14] hover:underline"
          >
            VER CATÁLOGO COMPLETO (12 MODELOS) →
          </Link>
        </div>

        {/* Grilla de 3 tarjetas siguiendo el Manual de Marca (#2A2A2A y rounded-lg = 8px) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {destacados.map((producto, idx) => {
            const marcaNombre =
              producto.marca_detalle?.nombre ||
              producto.marca?.nombre ||
              "VELOX LAB";
            const categoriaNombre =
              producto.categoria_detalle?.nombre ||
              producto.categoria?.nombre ||
              "COMPETICIÓN";
            const stockTotal =
              producto.stock_total ??
              (Array.isArray(producto.variantes)
                ? producto.variantes.reduce(
                    (acc, v) => acc + (Number(v.stock_actual) || 0),
                    0
                  )
                : 10);
            const skuRef =
              producto.sku_referencia ||
              producto.variantes?.[0]?.sku ||
              `VLX-PRO-0${idx + 1}`;
            const talles = producto.talles || ["40", "41", "42", "43"];
            const isHighlighted = Boolean(producto.es_destacado || idx === 1);

            return (
              <article
                key={producto.id || idx}
                className={`flex flex-col justify-between rounded-lg bg-[#2A2A2A] p-5 transition-colors ${
                  isHighlighted
                    ? "border-[1.5px] border-[#39FF14]"
                    : "border border-[#383838] hover:border-[#39FF14]/60"
                }`}
              >
                <div>
                  {/* Caja de Imagen con silueta PNG/SVG aislada y Glow */}
                  <div className="relative mb-5 flex h-[215px] w-full items-center justify-center rounded-md bg-[#181818] p-4 overflow-hidden">
                    <div
                      className="pointer-events-none absolute h-24 w-48 rounded-full bg-[#39FF14]/15 blur-2xl"
                      aria-hidden="true"
                    />

                    <div className="absolute top-3 left-3">
                      <Badge variant={isHighlighted ? "neon" : "default"}>
                        {isHighlighted ? "★ DESTACADO" : categoriaNombre}
                      </Badge>
                    </div>

                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={stockTotal <= 3 ? "danger" : "outline"}
                      >
                        {stockTotal <= 3
                          ? `ÚLTIMAS ${stockTotal}`
                          : `STOCK: ${stockTotal}`}
                      </Badge>
                    </div>

                    {/* Render aislado del calzado */}
                    <svg
                      viewBox="0 0 340 160"
                      className="relative z-10 w-64"
                      aria-hidden="true"
                    >
                      <path
                        d="M45 125 L80 65 L150 72 L215 45 L285 88 L300 120 L45 125 Z"
                        fill="#262626"
                        stroke={isHighlighted ? "#FFFFFF" : "#39FF14"}
                        strokeWidth="2"
                      />
                      <rect
                        x="40"
                        y="122"
                        width="265"
                        height="13"
                        rx="6"
                        fill="#39FF14"
                      />
                    </svg>
                  </div>

                  {/* Metadatos del producto */}
                  <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                    {marcaNombre} • {producto.genero || "UNISEX"}
                  </p>
                  <h3 className="mt-1 font-heading text-xl font-semibold text-[#FFFFFF]">
                    {producto.nombre}
                  </h3>
                  <p className="mt-2 text-xs text-[#D1D5DB] line-clamp-2">
                    {producto.descripcion} —{" "}
                    <span className="font-mono text-[#39FF14]">
                      SKU: {skuRef}
                    </span>
                  </p>

                  {/* Selector visual de talles AR */}
                  <div className="mt-4">
                    <p className="text-[11px] font-bold uppercase text-[#D1D5DB]">
                      TALLES DISPONIBLES (AR):
                    </p>
                    <div className="mt-2 flex gap-2">
                      {talles.map((talle) => {
                        const active =
                          talle === (producto.talle_activo || "41");
                        return (
                          <span
                            key={talle}
                            className={`inline-flex h-7 w-9 items-center justify-center rounded font-heading text-xs font-bold ${
                              active
                                ? "bg-[#39FF14] text-[#121212]"
                                : "bg-[#121212] text-[#D1D5DB]"
                            }`}
                          >
                            {talle}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Precio y CTA con Tono de Marca */}
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#383838]">
                  <span
                    className={`font-heading text-2xl font-bold ${
                      isHighlighted ? "text-[#39FF14]" : "text-[#FFFFFF]"
                    }`}
                  >
                    {formatPrecioARS(producto.precio_base)}
                  </span>
                  <Button
                    variant="primary"
                    href={`/productos/${producto.id || 1}`}
                    className="px-4 py-2.5 text-xs"
                  >
                    ANALIZAR RENDIMIENTO
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ==================== 3. BANNER DE ARQUITECTURA E IDENTIDAD VELOX ==================== */}
      <section className="rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] p-8 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
              ARQUITECTURA FULL-STACK • INGENIERÍA VELOX
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#FFFFFF]">
              SISTEMA DE INVENTARIO FÍSICO POR VARIANTE SKU
            </h2>
            <p className="text-sm text-[#D1D5DB] leading-relaxed">
              Cada calzado de VELOX separa el modelo conceptual (
              <code className="text-[#39FF14]">Producto</code>) de la unidad
              física en stock (
              <code className="text-[#39FF14]">VarianteProducto</code> con
              talle, color y código SKU único), conectando en tiempo real con
              los endpoints de Django REST Framework.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="rounded-lg bg-[#2A2A2A] p-4">
                <p className="font-heading text-lg font-bold text-[#39FF14]">
                  01. SKU ÚNICO
                </p>
                <p className="mt-1 text-xs text-[#D1D5DB]">
                  Normalización 3FN entre Producto conceptual y stock real por
                  talle y color.
                </p>
              </div>
              <div className="rounded-lg bg-[#2A2A2A] p-4">
                <p className="font-heading text-lg font-bold text-[#39FF14]">
                  02. JWT COOKIE
                </p>
                <p className="mt-1 text-xs text-[#D1D5DB]">
                  Autenticación segura mediante Server Actions y Cookies
                  HTTP-Only.
                </p>
              </div>
              <div className="rounded-lg bg-[#2A2A2A] p-4">
                <p className="font-heading text-lg font-bold text-[#39FF14]">
                  03. ZOD + RHF
                </p>
                <p className="mt-1 text-xs text-[#D1D5DB]">
                  Validación de formularios en paridad estricta snake_case con
                  DRF.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-between rounded-lg bg-[#2A2A2A] border border-[#39FF14]/40 p-6 space-y-5">
            <div>
              <Badge variant="neon">MANIFIESTO TÉCNICO</Badge>
              <h3 className="mt-3 font-heading text-xl font-bold text-[#FFFFFF]">
                INGENIERÍA EN FIBRA DE CARBONO
              </h3>
              <p className="mt-2 text-xs text-[#D1D5DB] leading-relaxed">
                Conocé cómo diseñamos nuestras placas propulsivas, compuestos de
                nitrógeno y suelas de tracción extrema.
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
