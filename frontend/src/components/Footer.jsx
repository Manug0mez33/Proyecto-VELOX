// Server Component: Componente puramente presentacional y estático sin hooks ni eventos de navegador; cero costo de hidratación en el cliente.

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[#2A2A2A] text-[#D1D5DB]">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Columna 1: Identidad y Manifiesto VELOX */}
          <div className="md:col-span-6 space-y-3">
            <Link
              href="/"
              className="inline-block font-heading text-3xl font-extrabold tracking-[0.15em] text-[#FFFFFF]"
            >
              VELO<span className="text-[#39FF14]">X</span>
            </Link>
            <p className="max-w-md text-sm text-[#9CA3AF]">
              Velocidad sin fricción. Rendimiento en cada paso. Diseñado para el
              movimiento.
            </p>
            <div className="pt-2 text-xs text-[#6B7280] space-y-1">
              <p>
                Evaluación Final Integradora (EFI 2026) — ITEC Río Cuarto
              </p>
              <p>
                Ingeniería de Software (Prof. Facundo Lemo) &amp; Programación
                III (Prof. Valentino Arballo)
              </p>
            </div>
          </div>

          {/* Columna 2: Rutas de Next.js (R1) */}
          <div className="md:col-span-3 space-y-2.5 text-sm">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14]">
              RUTAS NEXT.JS (R1)
            </h3>
            <ul className="space-y-2 text-[#D1D5DB]">
              <li>
                <Link href="/" className="hover:text-[#39FF14] transition-colors">
                  / (Landing &amp; Hero)
                </Link>
              </li>
              <li>
                <Link
                  href="/productos"
                  className="hover:text-[#39FF14] transition-colors"
                >
                  /productos (Catálogo)
                </Link>
              </li>
              <li>
                <Link
                  href="/tecnologia"
                  className="hover:text-[#39FF14] transition-colors"
                >
                  /tecnologia (Manifiesto)
                </Link>
              </li>
              <li>
                <Link
                  href="/carrito"
                  className="hover:text-[#39FF14] transition-colors"
                >
                  /carrito &amp; /login
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[#39FF14] transition-colors"
                >
                  /dashboard (Gestión SKU)
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Endpoints DRF Conectados */}
          <div className="md:col-span-3 space-y-2.5 text-sm">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14]">
              ENDPOINTS DRF (API)
            </h3>
            <ul className="space-y-2 text-xs font-mono text-[#D1D5DB]">
              <li>GET /api/productos/ (Paginado)</li>
              <li>GET /api/productos/destacados/</li>
              <li>GET /api/productos/&#123;id&#125;/stock_por_talle/</li>
              <li>POST /api/pedidos/ &amp; cancelar_pedido/</li>
              <li>GET /api/docs/ (Swagger OpenAPI 3)</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#1F1F1F] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-4">
          <p>
            © 2026 Equipo VELOX (Manuel Gómez, Valentino Cambria, Juan Falco,
            Tomás Benavidez) • Modo Oscuro Nativo.
          </p>
          <span className="font-mono text-[#39FF14]/80">
            Tokens: #121212 • #2A2A2A • #39FF14
          </span>
        </div>
      </div>
    </footer>
  );
}
