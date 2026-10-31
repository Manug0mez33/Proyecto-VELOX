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
      "Polímero supercrítico infundido con nitrógeno a alta presión. Reduce el peso del chasis en un 32% frente al compuesto tradicional sin perder absorción de impacto.",
  },
  {
    codigo: "MOD-03 • TRACCIÓN",
    titulo: "SUELA VORTEX GRIP HÚMEDO",
    metrica: "Drop oficial 8.0 mm",
    descripcion:
      "Compuesto de caucho micro-texturizado con canales de evacuación para mantener adherencia total tanto en pista sintética como en asfalto mojado.",
  },
];

const METRICAS_LABORATORIO = [
  {
    titulo: "PRUEBAS DE IMPACTO",
    valor: "15G",
    detalle: "Absorción de impacto en talón y antepié en carreras de fondo.",
  },
  {
    titulo: "TEST DE KILOMETRAJE",
    valor: "+800 KM",
    detalle: "Durabilidad de respuesta biomecánica sin pérdida de reactividad.",
  },
  {
    titulo: "ESTABILIDAD METATARSAL",
    valor: "99.2%",
    detalle: "Control torsional en curvas cerradas a ritmos bajo 3:15 min/km.",
  },
];

export default function TecnologiaPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-12 space-y-16">
      {/* Encabezado del Manifiesto */}
      <section className="rounded-xl bg-gradient-to-br from-[#1C1C1C] to-[#121212] border border-[#2A2A2A] p-8 sm:p-12 space-y-6">
        <Badge variant="outline">MANIFIESTO DE RENDIMIENTO</Badge>

        <h1 className="font-heading text-4xl sm:text-5xl font-bold uppercase tracking-tight text-[#FFFFFF] max-w-3xl">
          VELOCIDAD SIN FRICCIÓN.{" "}
          <span className="text-[#39FF14]">DISEÑADO PARA EL MOVIMIENTO.</span>
        </h1>

        <p className="max-w-2xl text-base text-[#FFFFFF] leading-relaxed">
          VELOX nace en la intersección entre la biomecánica deportiva y los
          materiales aeroespaciales de última generación. Cada milímetro de
          nuestros calzados está optimizado para transformar cada pisada en
          propulsión pura y velocidad constante.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button variant="primary" href="/productos">
            ADQUIRIR EQUIPAMIENTO →
          </Button>
          <Button variant="secondary" href="/">
            VOLVER AL INICIO
          </Button>
        </div>
      </section>

      {/* Pilares de Ingeniería del Calzado */}
      <section className="space-y-6">
        <div>
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
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
                <p className="text-sm text-[#E5E7EB] leading-relaxed">
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

      {/* Validación en Laboratorio y Pista */}
      <section className="rounded-xl bg-[#1B1B1B] border border-[#2A2A2A] p-8 sm:p-10 space-y-8">
        <div className="space-y-2">
          <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
            VALIDACIÓN Y CONTROL DE CALIDAD
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase text-[#FFFFFF]">
            PRUEBAS DE RENDIMIENTO Y RESISTENCIA
          </h2>
          <p className="text-sm text-[#E5E7EB] max-w-3xl leading-relaxed">
            Cada par es testeado por atletas de alto rendimiento en pista de
            atletismo y superficies urbanas exigentes, garantizando que la
            placa de carbono y la espuma reactiva mantengan sus propiedades
            óptimas en cada entrenamiento y competencia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {METRICAS_LABORATORIO.map((m) => (
            <div
              key={m.titulo}
              className="rounded-lg bg-[#2A2A2A] border border-[#383838] p-6 space-y-2"
            >
              <p className="font-heading text-3xl font-extrabold text-[#39FF14]">
                {m.valor}
              </p>
              <h3 className="font-heading text-sm font-bold uppercase text-[#FFFFFF]">
                {m.titulo}
              </h3>
              <p className="text-xs text-[#E5E7EB] leading-relaxed">
                {m.detalle}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
