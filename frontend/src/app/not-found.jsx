// Server Component: Página estática 404 (R1) renderizada en el servidor sin estado ni eventos de navegador cuando una ruta o SKU no existe.

import Button from "../components/Button";
import Badge from "../components/Badge";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col items-center justify-center px-6 lg:px-20 py-16 text-center">
      <div className="max-w-xl rounded-xl bg-[#2A2A2A] border border-[#383838] p-8 sm:p-12 space-y-6">
        <Badge variant="outline">CÓDIGO HTTP 404 • RUTA FUERA DE PISTA</Badge>

        <h1 className="font-heading text-5xl sm:text-6xl font-bold tracking-tight text-[#FFFFFF]">
          40<span className="text-[#39FF14]">4</span>
        </h1>

        <h2 className="font-heading text-xl sm:text-2xl font-semibold text-[#FFFFFF]">
          COORDENADA O CALZADO NO ENCONTRADO
        </h2>

        <p className="text-sm text-[#D1D5DB] leading-relaxed">
          El recurso o modelo SKU que intentás analizar no se encuentra
          registrado en el catálogo activo de VELOX.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button variant="primary" href="/productos">
            EXPLORAR CATÁLOGO →
          </Button>
          <Button variant="secondary" href="/">
            VOLVER AL INICIO
          </Button>
        </div>
      </div>
    </section>
  );
}
