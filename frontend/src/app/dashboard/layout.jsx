// Server Component: Layout anidado para la sección /dashboard (R1) que estructura el shell administrativo, barra lateral de navegación y métricas del sistema sin forzar hidratación en toda la página.

import Link from "next/link";
import Badge from "../../components/Badge";
import LogoutButton from "../../components/LogoutButton";

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "RESUMEN EJECUTIVO", icon: "📊" },
  { href: "/productos", label: "CATÁLOGO & STOCK", icon: "👟" },
  { href: "/carrito", label: "GESTIÓN DE PEDIDOS", icon: "📦" },
  { href: "/tecnologia", label: "TELEMETRÍA & LAB", icon: "⚡" },
];

export default function DashboardLayout({ children }) {
  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-8">
      {/* Barra superior de contexto de Dashboard (R1) */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#39FF14] animate-pulse" />
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
              PANEL DE CONTROL • VELOX CORE ENGINE
            </span>
          </div>
          <h1 className="mt-1 font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FFFFFF]">
            SISTEMA DE ADMINISTRACIÓN
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline">API: ONLINE (DRF v6.1)</Badge>
          <Badge variant="neon">ROL: STAFF / ADMIN</Badge>
        </div>
      </div>

      {/* Estructura dividida: Sidebar + Contenido Principal */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Barra Lateral de Navegación Anidada */}
        <aside className="lg:col-span-3 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 space-y-6">
          <div>
            <p className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#9CA3AF]">
              MÓDULOS DEL SISTEMA
            </p>
            <nav className="mt-3 flex flex-col space-y-1.5" aria-label="Navegación del Dashboard">
              {DASHBOARD_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#D1D5DB] transition-all hover:bg-[#2A2A2A] hover:text-[#39FF14] border border-transparent hover:border-[#39FF14]/30"
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="pt-4 border-t border-[#2A2A2A] space-y-3">
            <p className="text-[11px] font-heading font-bold uppercase tracking-wider text-[#9CA3AF]">
              CONTRATO DE INTEGRACIÓN
            </p>
            <div className="rounded-lg bg-[#141414] p-3 text-[11px] space-y-1.5 text-[#9CA3AF]">
              <p>
                <strong className="text-[#FFFFFF]">Arquitectura:</strong> Django REST + Next.js
              </p>
              <p>
                <strong className="text-[#FFFFFF]">Convención:</strong> Paridad <code className="text-[#39FF14]">snake_case</code>
              </p>
              <p>
                <strong className="text-[#FFFFFF]">Paginación:</strong> <code className="text-[#39FF14]">results[]</code>
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#2A2A2A] py-2.5 text-xs font-bold uppercase tracking-wider text-[#FFFFFF] transition-colors hover:bg-[#333333] hover:text-[#39FF14]"
            >
              ← VOLVER A LA TIENDA
            </Link>
            <LogoutButton />
          </div>
        </aside>

        {/* Contenido Anidado */}
        <div className="lg:col-span-9">
          {children}
        </div>
      </div>
    </div>
  );
}
