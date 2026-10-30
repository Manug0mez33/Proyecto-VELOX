// Server Component: Página estática de manifiesto técnico e ingeniería (/tecnologia - R1) renderizada en el servidor para máximo SEO y cero hidratación de estado en el cliente.

import Button from "../../components/Button";
import Badge from "../../components/Badge";

const PILARES_TECNOLOGICOS = [
  {
    codigo: "MOD-01 • PROPULSIÓN",
    titulo: "PLACA DE CARBONO BI-DENSIDAD",
    metrica: "+87% Retorno de energía",
    descripcion:
      "Geometría curva en cuchara laminada en 12 capas de fibra de carbono aeroespacial. Estabiliza el metatarso y actúa como palanca elástica en el despegue.",
  },
  {
    codigo: "MOD-02 • AMORTIGUACIÓN",
    titulo: "ESPUMA NITRO-FOAM INYECTADA",
    metrica: "168 g en Talle 41 AR",
    descripcion:
      "Polímero supercrítico infundido con nitrógeno a alta presión. Reduce el peso del chasis en un 32% frente al EVA tradicional sin perder absorción de impacto.",
  },
  {
    codigo: "MOD-03 • TRACCIÓN",
    titulo: "SUELA VORTEX GRIP HÚMEDO",
    metrica: "Drop oficial 8.0 mm",
    descripcion:
      "Compuesto de caucho micro-texturizado con canales de evacuación de agua para mantener adherencia total tanto en pista sintética como en asfalto mojado.",
  },
];

const TOKENS_MARCA = [
  { nombre: "Base (Fondo Nativo)", hex: "#121212", muestra: "bg-[#121212]" },
  { nombre: "Surface (Cards 8px)", hex: "#2A2A2A", muestra: "bg-[#2A2A2A]" },
  {
    nombre: "Accent (Verde Neón)",
    hex: "#39FF14",
    muestra: "bg-[#39FF14] text-[#121212]",
  },
  {
    nombre: "Text Primary",
    hex: "#FFFFFF",
    muestra: "bg-[#FFFFFF] text-[#121212]",
  },
  {
    nombre: "Text Secondary",
    hex: "#D1D5DB",
    muestra: "bg-[#D1D5DB] text-[#121212]",
  },
];

export default function TecnologiaPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-12 space-y-16">
      {/* Encabezado del Manifiesto */}
      <section className="rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#121212] border border-[#2A2A2A] p-8 sm:p-12 space-y-6">
        <Badge variant="outline">MANIFIESTO DE INGENIERÍA • RUTA R1</Badge>

        <h1 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#FFFFFF] max-w-3xl">
          VELOCIDAD SIN FRICCIÓN.{" "}
          <span className="text-[#39FF14]">DISEÑADO PARA EL MOVIMIENTO.</span>
        </h1>

        <p className="max-w-2xl text-base text-[#D1D5DB] leading-relaxed">
          VELOX nace en la intersección entre la biomecánica deportiva y la
          ingeniería de software moderna. Eliminamos el ruido visual con una
          interfaz Modo Oscuro nativa donde el rendimiento técnico del calzado
          es el único protagonista.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button variant="primary" href="/productos">
            ADQUIRIR EQUIPAMIENTO →
          </Button>
          <Button variant="secondary" href="/">
            VOLVER A LA PISTA
          </Button>
        </div>
      </section>

      {/* Pilares de Ingeniería del Calzado */}
      <section className="space-y-6">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#39FF14]">
            LABORATORIO BIOMECÁNICO VELOX LAB
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#FFFFFF] mt-1">
            TRES PILARES DE RENDIMIENTO
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PILARES_TECNOLOGICOS.map((pilar) => (
            <article
              key={pilar.codigo}
              className="flex flex-col justify-between rounded-lg bg-[#2A2A2A] border border-[#383838] p-6 space-y-4"
            >
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-[#39FF14]">
                  {pilar.codigo}
                </span>
                <h3 className="font-heading text-xl font-bold text-[#FFFFFF]">
                  {pilar.titulo}
                </h3>
                <p className="text-sm text-[#D1D5DB] leading-relaxed">
                  {pilar.descripcion}
                </p>
              </div>
              <div className="pt-4 border-t border-[#383838]">
                <span className="font-heading text-sm font-bold text-[#39FF14]">
                  {pilar.metrica}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Arquitectura Full-Stack y Tokens de Marca */}
      <section className="rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] p-8 sm:p-10 space-y-8">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#39FF14]">
            IDENTIDAD VISUAL &amp; TRAZABILIDAD TÉCNICA
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#FFFFFF]">
            SISTEMA DE TOKENS TAILWIND CSS v4 Y MODELADO SKU
          </h2>
          <p className="text-sm text-[#D1D5DB] max-w-3xl">
            Nuestro sistema conecta 12 modelos relacionales en Django 6 + DRF
            con Next.js App Router, manteniendo paridad estricta{" "}
            <code className="text-[#39FF14]">snake_case</code> y control de
            stock exacto por combinación de Producto, Talle y Color (
            <code className="text-[#39FF14]">VarianteProducto</code>).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {TOKENS_MARCA.map((token) => (
            <div
              key={token.hex}
              className="rounded-lg bg-[#2A2A2A] border border-[#383838] p-4 space-y-3"
            >
              <div
                className={`h-10 w-full rounded border border-[#444] flex items-center justify-center font-mono text-xs font-bold ${token.muestra}`}
              >
                {token.hex}
              </div>
              <p className="text-xs font-semibold text-[#D1D5DB]">
                {token.nombre}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
