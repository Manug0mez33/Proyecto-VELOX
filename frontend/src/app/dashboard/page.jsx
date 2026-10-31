"use client";
// Client Component ("use client"): Vista principal del panel de control (/dashboard - R1, R3) con KPIs ejecutivos reactivos al inventario real, accesos directos a pedidos y módulo interactivo de gestión CRUD sobre variantes de inventario y reseñas de calzado.

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import DashboardCrudManager, { SAMPLE_VARIANTES } from "../../components/DashboardCrudManager";

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
    endpoint: "GET / POST / PATCH / DELETE /api/variantes/{sku}/",
    estado: "SINCRONIZADO",
    descripcion: "Asignación de talles AR, colores y SKU únicos con control de integridad.",
    accion: "/dashboard",
  },
  {
    recurso: "Reseñas de Calzado",
    endpoint: "GET / POST / PATCH / DELETE /api/resenas/{id}/",
    estado: "OPERATIVO",
    descripcion: "Valoración técnica de atletas de 1 a 5 estrellas con moderación directa.",
    accion: "/dashboard",
  },
  {
    recurso: "Pedidos Transaccionales",
    endpoint: "GET / POST /api/pedidos/ y @action cancelar_pedido",
    estado: "ACTIVO",
    descripcion: "Flujo de compra con cálculo de totales y restitución atómica de stock.",
    accion: "/dashboard/pedidos",
  },
];

export default function DashboardPage() {
  const [variantes, setVariantes] = useState(SAMPLE_VARIANTES);

  const handleVariantesChange = useCallback((nuevasVariantes) => {
    setVariantes(nuevasVariantes);
  }, []);

  // Cálculo reactivo de métricas de inventario
  const totalStock = useMemo(() => {
    if (!Array.isArray(variantes)) return 0;
    return variantes.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
  }, [variantes]);

  const activasCount = useMemo(() => {
    if (!Array.isArray(variantes)) return 0;
    return variantes.filter((v) => v.activo !== false).length;
  }, [variantes]);

  const kpis = useMemo(
    () => [
      {
        titulo: "MODELOS EN CATÁLOGO",
        valor: "12",
        subtexto: "Normalizados en 3FN (Producto)",
        color: "#39FF14",
        enlace: "/productos",
      },
      {
        titulo: "VARIANTES SKU ACTIVAS",
        valor: String(activasCount),
        subtexto: "Combinación Talle + Color única",
        color: "#FFFFFF",
        enlace: "/dashboard",
      },
      {
        titulo: "STOCK EN DEPÓSITO",
        valor: `${totalStock} u.`,
        subtexto: "Unidades físicas vendibles",
        color: "#39FF14",
        enlace: "/dashboard",
      },
      {
        titulo: "GESTIÓN DE PEDIDOS",
        valor: "24",
        subtexto: "Órdenes transaccionales y @action",
        color: "#FFFFFF",
        enlace: "/dashboard/pedidos",
      },
    ],
    [activasCount, totalStock]
  );

  return (
    <div className="space-y-8">
      {/* 1. Grilla de Métricas Principales (KPIs) */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.titulo}
            href={kpi.enlace}
            className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 transition-all hover:border-[#39FF14]/50 hover:bg-[#222222]"
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
          </Link>
        ))}
      </section>

      {/* 2. Módulo Interactivo de 4 Operaciones CRUD (R3) */}
      <section>
        <DashboardCrudManager onVariantesChange={handleVariantesChange} />
      </section>

      {/* 3. Matriz de Control de Endpoints de la API */}
      <section className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2A2A] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">ARQUITECTURA DE INTEGRACIÓN</Badge>
              <h2 className="font-heading text-base sm:text-lg font-bold uppercase text-[#FFFFFF]">
                MATRIZ DE ENDPOINTS DRF Y COBERTURA DE RECURSOS
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#D1D5DB]">
              Servicios REST expuestos por Django REST Framework y consumidos reactivamente por la capa cliente de Next.js.
            </p>
          </div>

          <Button variant="secondary" href="/dashboard/pedidos" className="text-xs">
            VER GESTIÓN DE PEDIDOS →
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

      {/* 4. Banner Informativo de Arquitectura de Defensa */}
      <section className="rounded-xl bg-gradient-to-r from-[#1E1E1E] to-[#161616] border border-[#2A2A2A] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#39FF14]" />
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14]">
              DEFENSA ORAL • PROGRAMACIÓN III (PROF. VALENTINO ARBALLO)
            </span>
          </div>
          <h3 className="font-heading text-xl font-bold uppercase text-[#FFFFFF]">
            RUTAS ANIDADAS, DINÁMICAS Y COBERTURA CRUD
          </h3>
          <p className="text-xs text-[#D1D5DB] max-w-2xl leading-relaxed">
            La arquitectura implementa la ruta anidada <code className="text-[#39FF14]">/dashboard/pedidos</code> y la 2da ruta dinámica <code className="text-[#39FF14]">/dashboard/pedidos/[id]</code> con ejecución de la acción <code className="text-[#39FF14]">POST /api/pedidos/[id]/cancelar_pedido/</code>. Las 4 operaciones CRUD (<code className="text-[#39FF14]">GET</code>, <code className="text-[#39FF14]">POST</code>, <code className="text-[#39FF14]">PATCH</code>, <code className="text-[#39FF14]">DELETE</code>) se ejecutan interactivamente en este módulo.
          </p>
        </div>

        <div className="flex-shrink-0">
          <Button variant="primary" href="/dashboard/pedidos">
            GESTIONAR PEDIDOS (R1)
          </Button>
        </div>
      </section>
    </div>
  );
}
