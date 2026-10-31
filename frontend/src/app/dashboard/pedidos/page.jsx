"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { api, ApiError } from "../../../lib/api";
import Badge from "../../../components/Badge";
import Button from "../../../components/Button";

const ESTADOS_FILTRO = [
  { id: "TODOS", label: "TODOS" },
  { id: "PENDIENTE", label: "PENDIENTES" },
  { id: "PAGADO", label: "PAGADOS" },
  { id: "ENVIADO", label: "ENVIADOS" },
  { id: "ENTREGADO", label: "ENTREGADOS" },
  { id: "CANCELADO", label: "CANCELADOS" },
];

function formatARS(valor) {
  const num = Number(valor) || 0;
  return `$${num.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

function formatFecha(fechaStr) {
  if (!fechaStr) return "Reciente";
  try {
    const d = new Date(fechaStr);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fechaStr;
  }
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const syncToken = () => {
      try {
        const storedToken = localStorage.getItem("velox_access_token");
        const storedUser = localStorage.getItem("velox_username");
        setToken(storedToken || null);
        setUsername(storedUser || null);
      } catch {
        setToken(null);
        setUsername(null);
      }
    };

    syncToken();
    window.addEventListener("velox-auth-changed", syncToken);
    window.addEventListener("storage", syncToken);
    return () => {
      window.removeEventListener("velox-auth-changed", syncToken);
      window.removeEventListener("storage", syncToken);
    };
  }, []);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getPaginated("/pedidos/", { token: currentToken });
      setPedidos(response?.results || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo conectar con el servicio de Pedidos.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const cumpleEstado =
        filtroEstado === "TODOS" || pedido.estado === filtroEstado;

      const query = searchQuery.trim().toLowerCase();
      if (!query) return cumpleEstado;

      const cumpleQuery =
        String(pedido.id).includes(query) ||
        (pedido.usuario?.username || "").toLowerCase().includes(query) ||
        (pedido.usuario?.email || "").toLowerCase().includes(query) ||
        (pedido.direccion_envio || "").toLowerCase().includes(query) ||
        (pedido.detalles || []).some((det) =>
          (det.sku || "").toLowerCase().includes(query) ||
          (det.producto_nombre || "").toLowerCase().includes(query)
        );

      return cumpleEstado && cumpleQuery;
    });
  }, [pedidos, filtroEstado, searchQuery]);

  const conteoPorEstado = useMemo(() => {
    const counts = { TODOS: pedidos.length };
    pedidos.forEach((p) => {
      counts[p.estado] = (counts[p.estado] || 0) + 1;
    });
    return counts;
  }, [pedidos]);

  const renderBadgeEstado = (estado, estadoDisplay) => {
    const label = estadoDisplay || estado;
    switch (estado) {
      case "ENTREGADO":
        return <Badge variant="neon">{label}</Badge>;
      case "PAGADO":
        return <Badge variant="outline">{label}</Badge>;
      case "ENVIADO":
        return (
          <span className="inline-flex items-center justify-center rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#1E293B] text-[#38BDF8] border border-[#0284C7]">
            {label}
          </span>
        );
      case "CANCELADO":
        return <Badge variant="danger">{label}</Badge>;
      case "PENDIENTE":
      default:
        return (
          <span className="inline-flex items-center justify-center rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#332510] text-[#FBBF24] border border-[#B45309]">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-5">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-[#FFFFFF]">
            GESTIÓN DE PEDIDOS
          </h2>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            Monitoreo en tiempo real de transacciones, estados de despacho y control de entregas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchPedidos}
            disabled={loading}
            className="text-xs py-2 px-3"
          >
            {loading ? "ACTUALIZANDO..." : "↻ ACTUALIZAR"}
          </Button>
          <Button variant="primary" href="/carrito" className="text-xs py-2 px-4">
            + NUEVA COMPRA
          </Button>
        </div>
      </div>

      {/* 2. Banner de autenticación si no hay token */}
      {!token && (
        <div className="rounded-xl bg-[#2A1515] border border-[#EF4444] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <h3 className="font-heading text-sm font-bold uppercase text-[#FFFFFF]">
              INICIO DE SESIÓN REQUERIDO
            </h3>
          </div>
          <p className="text-xs text-[#FCA5A5] leading-relaxed">
            Para consultar el listado de pedidos asociados a tu cuenta, por favor iniciá sesión.
          </p>
          <div className="pt-1">
            <Button variant="primary" href="/login" className="text-xs py-2 px-4">
              INICIAR SESIÓN AHORA →
            </Button>
          </div>
        </div>
      )}

      {/* 3. Mensaje de error */}
      {error && (
        <div className="rounded-xl bg-[#2A1515] border border-[#EF4444] p-4 text-xs text-[#FCA5A5] flex items-center justify-between gap-4">
          <span>{error}</span>
          <button
            onClick={fetchPedidos}
            className="text-xs font-bold uppercase text-[#FFFFFF] underline hover:text-[#39FF14]"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 4. Filtros por estado y Barra de búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filtros de estado */}
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtrar pedidos por estado">
          {ESTADOS_FILTRO.map((tab) => {
            const activo = filtroEstado === tab.id;
            const cantidad = conteoPorEstado[tab.id] || 0;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activo}
                onClick={() => setFiltroEstado(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activo
                    ? "bg-[#39FF14] text-[#121212] shadow-[0_0_15px_rgba(57,255,20,0.25)]"
                    : "bg-[#1E1E1E] text-[#9CA3AF] hover:bg-[#2A2A2A] hover:text-[#FFFFFF] border border-[#2A2A2A]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    activo ? "bg-[#121212] text-[#39FF14]" : "bg-[#2A2A2A] text-[#D1D5DB]"
                  }`}
                >
                  {cantidad}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar por ID, referencia o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-[#141414] border border-[#2A2A2A] px-3.5 py-2 text-xs text-[#FFFFFF] placeholder-[#6B7280] focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
            aria-label="Buscar pedidos"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-[#FFFFFF]"
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 5. Estado de Carga */}
      {loading && (
        <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-6 space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse space-y-2 border-b border-[#2A2A2A] pb-4 last:border-0">
              <div className="h-4 w-1/4 rounded bg-[#2A2A2A]" />
              <div className="h-3 w-1/2 rounded bg-[#222222]" />
            </div>
          ))}
        </div>
      )}

      {/* 6. Tabla de Pedidos */}
      {!loading && pedidosFiltrados.length > 0 && (
        <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2A2A2A] bg-[#181818] text-[11px] font-heading font-bold uppercase text-[#9CA3AF]">
                <tr>
                  <th className="py-3 px-4">Orden</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Artículos</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A] bg-[#141414]">
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-[#202020]/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#39FF14]">
                      #{pedido.id}
                    </td>
                    <td className="py-3.5 px-4 text-[#D1D5DB]">
                      {formatFecha(pedido.fecha_creacion)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-white">
                        {pedido.usuario?.username || "cliente"}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">
                        {pedido.usuario?.email || ""}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-[#D1D5DB]">
                      <p className="font-medium text-white">
                        {pedido.detalles?.map((d) => d.producto_nombre).filter(Boolean).join(", ") ||
                          `${(pedido.detalles || []).length} calzado(s)`}
                      </p>
                      <p className="text-[10px] text-[#6B7280]">
                        {(pedido.detalles || []).length} calzado(s)
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {renderBadgeEstado(pedido.estado, pedido.estado_display)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {formatARS(pedido.total)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/dashboard/pedidos/${pedido.id}`}
                        className="inline-flex items-center justify-center rounded bg-[#2A2A2A] px-2.5 py-1 text-[11px] font-heading font-bold uppercase text-[#FFFFFF] hover:bg-[#39FF14] hover:text-[#121212] transition-colors"
                      >
                        VER FICHA →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Estado Vacío */}
      {!loading && pedidosFiltrados.length === 0 && (
        <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-12 text-center space-y-4">
          <div className="text-4xl">📦</div>
          <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF]">
            NO SE ENCONTRARON PEDIDOS
          </h3>
          <p className="text-xs text-[#9CA3AF] max-w-sm mx-auto">
            {searchQuery || filtroEstado !== "TODOS"
              ? "No hay pedidos que coincidan con los filtros seleccionados."
              : "Aún no se han generado órdenes de compra en el sistema."}
          </p>
        </div>
      )}
    </div>
  );
}
