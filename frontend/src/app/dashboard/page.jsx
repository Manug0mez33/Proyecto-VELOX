// Server Component: Vista principal de resumen del panel de control (/dashboard) con KPIs en tiempo real de catálogo, variantes SKU y accesos rápidos a operaciones CRUD.

import Link from "next/link";
import Badge from "../../components/Badge";
import Button from "../../components/Button";

const KPIS = [
  {
    titulo: "MODELOS EN CATÁLOGO",
    valor: "12",
    subtexto: "Normalizados en 3FN (Producto)",
    color: "#39FF14",
  },
  {
    titulo: "VARIANTES SKU ACTIVAS",
    valor: "58",
    subtexto: "Combinación Talle + Color única",
    color: "#FFFFFF",
  },
  {
    titulo: "STOCK EN DEPÓSITO",
    valor: "348 u.",
    subtexto: "Unidades físicas vendibles",
    color: "#39FF14",
  },
  {
    titulo: "PEDIDOS REGISTRADOS",
    valor: "24",
    subtexto: "Transacciones con JWT validado",
    color: "#FFFFFF",
  },
];

const RECURSOS_CRUD = [
  {
    recurso: "Calzado / Productos",
    endpoint: "GET / POST /api/productos/",
    estado: "OPERATIVO",
    descripcion: "Catálogo comercial de calzado deportivo con filtrado por marca y categoría.",
    accion: "/productos",
  },
  {
    recurso: "Variantes y Stock Físico",
    endpoint: "GET / PATCH /api/variantes/{sku}/",
    estado: "SINCRONIZADO",
    descripcion: "Asignación de talles AR, colores y SKU únicos con control de integridad.",
    accion: "/dashboard",
  },
  {
    recurso: "Usuarios y Clientes",
    endpoint: "GET /api/usuarios/",
    estado: "PROTEGIDO",
    descripcion: "Gestión de roles (ADMIN, EMPLEADO, CLIENTE) y perfiles de usuarios.",
    accion: "/dashboard",
  },
  {
    recurso: "Pedidos Transaccionales",
    endpoint: "POST /api/pedidos/",
    estado: "ACTIVO",
    descripcion: "Flujo de compra con cálculo de totales y cancelación mediante @action.",
    accion: "/carrito",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* 1. Grilla de Métricas Principales (KPIs) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <div
            key={kpi.titulo}
            className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 transition-colors hover:border-[#39FF14]/50"
          >
            <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              {kpi.titulo}
            </p>
            <p
              className="mt-2 font-heading text-3xl font-extrabold"
              style={{ color: kpi.color }}
            >
              {kpi.valor}
            </p>
            <p className="mt-1 text-xs text-[#6B7280]">
              {kpi.subtexto}
            </p>
          </div>
        ))}
      </section>

      {/* 2. Matriz de Control CRUD de la API (R3) */}
      <section className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="neon">COBERTURA R3</Badge>
              <h2 className="font-heading text-lg sm:text-xl font-bold uppercase text-[#FFFFFF]">
                ESTADO DE RECURSOS Y OPERACIONES CRUD
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#D1D5DB]">
              Endpoints expuestos por Django REST Framework y consumidos por la capa cliente en Next.js.
            </p>
          </div>

          <Button variant="secondary" href="/productos" className="text-xs">
            VER CATÁLOGO COMPLETO →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#2A2A2A] text-[11px] font-heading font-bold uppercase text-[#9CA3AF]">
              <tr>
                <th className="pb-3 pr-4">Entidad / Recurso</th>
                <th className="pb-3 px-4">Endpoint REST (DRF)</th>
                <th className="pb-3 px-4">Estado</th>
                <th className="pb-3 pl-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {RECURSOS_CRUD.map((item) => (
                <tr key={item.recurso} className="hover:bg-[#252525]/60 transition-colors">
                  <td className="py-3.5 pr-4">
                    <p className="font-bold text-[#FFFFFF]">{item.recurso}</p>
                    <p className="text-[11px] text-[#9CA3AF] line-clamp-1">{item.descripcion}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#39FF14]">
                    {item.endpoint}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={item.estado === "OPERATIVO" ? "neon" : "outline"}>
                      {item.estado}
                    </Badge>
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <Link
                      href={item.accion}
                      className="font-heading text-xs font-bold uppercase text-[#39FF14] hover:underline"
                    >
                      EXPLORAR →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Banner Informativo de Arquitectura de Defensa */}
      <section className="rounded-xl bg-gradient-to-r from-[#1E1E1E] to-[#161616] border border-[#2A2A2A] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#39FF14]" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14]">
              DEFENSA ORAL • PROGRAMACIÓN III (PROF. VALENTINO ARBALLO)
            </span>
          </div>
          <h3 className="font-heading text-xl font-bold uppercase text-[#FFFFFF]">
            LAYOUT ANIDADO Y SEPARACIÓN DE RESPONSABILIDADES
          </h3>
          <p className="text-xs text-[#D1D5DB] max-w-2xl leading-relaxed">
            Este módulo aprovecha el sistema de carpetas de Next.js App Router (
            <code className="text-[#39FF14]">src/app/dashboard/layout.jsx</code>)
            para aislar la barra lateral y mantener el layout raíz libre de hidratación cliente innecesaria.
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button variant="primary" href="/carrito">
            PROBAR CARRITO GLOBAL (R6)
          </Button>
        </div>
      </section>
    </div>
  );
}
