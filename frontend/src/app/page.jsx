import Link from "next/link";
import Button from "../components/Button";
import Badge from "../components/Badge";
import ProductCard from "../components/ProductCard";
import { api } from "../lib/api";

function formatPrecioARS(valor) {
  const numero = Number(valor) || 0;
  return `$${numero.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

function datosHero(producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    marca: producto.marca?.nombre || "",
    categoria: producto.categoria?.nombre || "",
    genero: producto.genero_display || producto.genero,
    precio: formatPrecioARS(producto.precio_base),
    referencia: producto.variantes?.[0]?.sku || "—",
    stock: Number(producto.stock_total ?? 0),
  };
}

// GET /api/productos/destacados/: 1 producto para el hero + 3 para la grilla.
// Si la API falla, la home se muestra sin productos en vez de inventarlos.
async function getProductosDestacados() {
  try {
    const data = await api.get("/productos/destacados/", { next: { revalidate: 30 } });
    const items = Array.isArray(data) ? data : data?.results;
    return Array.isArray(items) ? items.slice(0, 4) : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [productoHero, ...destacados] = await getProductosDestacados();
  const hero = productoHero ? datosHero(productoHero) : null;

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

          <p className="max-w-xl text-base text-[#FFFFFF] leading-relaxed">
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
          {hero ? (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E1E1E] to-[#141414] border border-[#2A2A2A] p-6 sm:p-8">
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-md bg-[#2A2A2A] px-3 py-1.5 font-heading text-[11px] font-bold tracking-wider text-[#39FF14]">
                REF: {hero.referencia}
              </span>
              <Badge variant={hero.stock > 3 ? "outline" : "danger"}>
                {hero.stock > 3 ? "DISPONIBLE" : `ÚLTIMAS ${hero.stock}`}
              </Badge>
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
                aria-label={`Silueta ${hero.nombre}`}
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
                <Link href={`/productos/${hero.id}`}>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase text-[#FFFFFF] hover:text-[#39FF14] transition-colors">
                    {hero.nombre}
                  </h2>
                </Link>
                <p className="text-xs sm:text-sm text-[#D1D5DB]">
                  {[hero.categoria, hero.marca, hero.genero].filter(Boolean).join(" • ")}
                </p>
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-[#39FF14]">
                {hero.precio}
              </p>
            </div>
          </div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-8 text-center text-sm text-[#9CA3AF]">
              No hay lanzamientos disponibles en este momento.
            </div>
          )}
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
        {destacados.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {destacados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#9CA3AF]">
            No hay calzados destacados para mostrar en este momento.
          </p>
        )}
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
