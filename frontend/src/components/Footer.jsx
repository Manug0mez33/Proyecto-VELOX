import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[#2A2A2A] text-[#D1D5DB]">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Columna 1: Marca y Propósito */}
          <div className="md:col-span-5 space-y-3">
            <Link
              href="/"
              className="inline-block font-heading text-3xl font-extrabold tracking-[0.15em] text-[#FFFFFF]"
            >
              VELO<span className="text-[#39FF14]">X</span>
            </Link>
            <p className="max-w-md text-sm text-[#9CA3AF] leading-relaxed">
              Velocidad sin fricción. Rendimiento en cada zancada. Diseñado para
              atletas y corredores que buscan superar sus propios límites con
              ingeniería en fibra de carbono.
            </p>
          </div>

          {/* Columna 2: Navegación de la Tienda */}
          <div className="md:col-span-3 space-y-2.5 text-sm">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14]">
              NAVEGACIÓN
            </h3>
            <ul className="space-y-2 text-[#D1D5DB]">
              <li>
                <Link href="/" className="hover:text-[#39FF14] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="hover:text-[#39FF14] transition-colors"
                >
                  Catálogo de Calzados
                </Link>
              </li>
              <li>
                <Link
                  href="/tecnologia"
                  className="hover:text-[#39FF14] transition-colors"
                >
                  Innovación y Rendimiento
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="hover:text-[#39FF14] transition-colors"
                >
                  Bolsa de Compras
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[#39FF14] transition-colors"
                >
                  Panel de Gestión
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Atención al Cliente */}
          <div className="md:col-span-4 space-y-2.5 text-sm">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14]">
              ATENCIÓN AL CLIENTE
            </h3>
            <ul className="space-y-2 text-[#9CA3AF]">
              <li>Envíos rápidos a todo el país</li>
              <li>Garantía oficial y cambios sin costo</li>
              <li>Guía interactiva de talles AR</li>
              <li>Atención personalizada a atletas</li>
              <li>Pagos seguros con tarjetas y transferencia</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#1F1F1F] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-4">
          <p>
            © 2026 VELOX Argentina. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span>Envíos seguros a nivel nacional</span>
            <span>•</span>
            <span>Garantía de rendimiento</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
