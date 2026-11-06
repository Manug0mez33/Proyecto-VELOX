"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import DashboardCrudManager from "../../components/DashboardCrudManager";
import { api } from "../../lib/api";

export default function DashboardPage() {
  const [variantes, setVariantes] = useState([]);
  // Totales reales de la API (page_size=1: solo interesa el "count" de la respuesta paginada).
  const [totalModelos, setTotalModelos] = useState(null);
  const [totalPedidos, setTotalPedidos] = useState(null);

  useEffect(() => {
    const contar = (endpoint, setter) =>
      api
        .getPaginated(endpoint, { params: { page_size: 1 } })
        .then((res) => setter(res.count))
        .catch(() => setter(null));
    contar("/productos/", setTotalModelos);
    contar("/pedidos/", setTotalPedidos);
  }, []);

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
        valor: totalModelos ?? "—",
        subtexto: "Modelos cargados en el catálogo",
        color: "#39FF14",
        enlace: "/productos",
      },
      {
        titulo: "VARIANTES CON STOCK",
        valor: String(activasCount),
        subtexto: "Combinaciones de talle y color",
        color: "#FFFFFF",
        enlace: "/dashboard",
      },
      {
        titulo: "STOCK EN DEPÓSITO",
        valor: `${totalStock} u.`,
        subtexto: "Unidades totales disponibles",
        color: "#39FF14",
        enlace: "/dashboard",
      },
      {
        titulo: "GESTIÓN DE PEDIDOS",
        valor: totalPedidos ?? "—",
        subtexto: "Órdenes de compra registradas",
        color: "#FFFFFF",
        enlace: "/dashboard/pedidos",
      },
    ],
    [activasCount, totalStock, totalModelos, totalPedidos]
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

      {/* 2. Módulo Interactivo de Gestión de Inventario y Reseñas */}
      <section>
        <DashboardCrudManager onVariantesChange={handleVariantesChange} />
      </section>
    </div>
  );
}
