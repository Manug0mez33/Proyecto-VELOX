"use client";
// Client Component ("use client"): Gestión reactiva de pedidos (/dashboard/pedidos - R1) con consumo de GET /api/pedidos/ vía JWT, filtrado dinámico por estado, badges semánticos y estados de carga/vacío.

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

  // Sincronizar token JWT desde localStorage
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
        setError("No se pudo conectar con el servicio de Pedidos de Django REST Framework.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Filtrado reactivo por estado y búsqueda
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

  // Conteo de pedidos por estado para badges del filtro
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
          <div className="flex items-center gap-2">
            <Badge variant="neon">RUTA ANIDADA R1</Badge>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-[#FFFFFF]">
              GESTIÓN REACTIVA DE PEDIDOS
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            Monitoreo en tiempo real de transacciones, estados de despacho y control de inventario restituible.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchPedidos}
            disabled={loading}
            className="text-xs py-2 px-3"
          >
            {loading ? "SINCRONIZANDO..." : "↻ ACTUALIZAR"}
          </Button>
          <Button variant="primary" href="/carrito" className="text-xs py-2 px-4">
            + NUEVA ORDEN
          </Button>
        </div>
      </div>

      {/* 2. Banner de autenticación si no hay token */}
      {!token && (
        <div className="rounded-xl bg-[#2A1515] border border-[#EF4444] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
            <h3 className="font-heading text-sm font-bold uppercase text-[#FFFFFF]">
              SESIÓN JWT REQUERIDA (DRF AUTHENTICATION)
            </h3>
          </div>
          <p className="text-xs text-[#FCA5A5] leading-relaxed">
            Para consultar el listado de pedidos autenticados con Django REST Framework (
            <code className="text-white font-mono">GET /api/pedidos/</code>
            ), debes iniciar sesión con una cuenta de atleta o administrador.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Button variant="primary" href="/login" className="text-xs py-2 px-4">
              INICIAR SESIÓN AHORA →
            </Button>
            <span className="text-xs text-[#D1D5DB]">
              Credenciales EFI: <strong className="text-[#39FF14]">admin / admin1234</strong> o{" "}
              <strong className="text-white">cliente1 / cliente1234</strong>
            </span>
          </div>
        </div>
      )}

      {/* 3. Mensaje de error de API */}
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
            placeholder="Buscar por ID, SKU o cliente..."
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

      {/* 5. Estado de Carga (Skeletons) */}
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
                  <th className="py-3.5 px-4">Orden</th>
                  <th className="py-3.5 px-4">Cliente / Destino</th>
                  <th className="py-3.5 px-4">Calzados (SKU)</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {pedidosFiltrados.map((pedido) => {
                  const cantItems = (pedido.detalles || []).reduce(
                    (acc, d) => acc + (d.cantidad || 1),
                    0
                  );
                  return (
                    <tr
                      key={pedido.id}
                      className="hover:bg-[#252525]/70 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#39FF14]">
                        #{pedido.id}
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#FFFFFF]">
                          {pedido.usuario?.username || username || "Atleta VELOX"}
                        </p>
                        <p className="text-[11px] text-[#9CA3AF] line-clamp-1">
                          {pedido.direccion_envio || "Retiro en punto VELOX"}
                        </p>
                      </td>

                      {/* Desglose resumido de calzados */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-[#D1D5DB]">
                          {pedido.detalles?.[0]?.producto_nombre || `${cantItems} pares`}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(pedido.detalles || []).slice(0, 2).map((det) => (
                            <span
                              key={det.id || det.sku}
                              className="font-mono text-[10px] text-[#39FF14] bg-[#141414] px-1.5 py-0.5 rounded border border-[#2A2A2A]"
                            >
                              {det.sku}
                            </span>
                          ))}
                          {(pedido.detalles || []).length > 2 && (
                            <span className="text-[10px] text-[#9CA3AF]">
                              +{(pedido.detalles || []).length - 2} más
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="py-3.5 px-4 text-[#9CA3AF]">
                        {formatFecha(pedido.fecha_creacion)}
                      </td>

                      {/* Estado con Badge */}
                      <td className="py-3.5 px-4">
                        {renderBadgeEstado(pedido.estado, pedido.estado_display)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-heading font-bold text-[#FFFFFF]">
                        {formatARS(pedido.total)}
                      </td>

                      {/* Acción a 2da ruta dinámica */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/pedidos/${pedido.id}`}
                          className="inline-flex items-center gap-1 rounded bg-[#2A2A2A] px-3 py-1.5 text-[11px] font-heading font-bold uppercase text-[#FFFFFF] hover:bg-[#39FF14] hover:text-[#121212] transition-colors"
                        >
                          VER DETALLE →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Empty State cuando no hay pedidos */}
      {!loading && pedidosFiltrados.length === 0 && (
        <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A] text-xl">
            📦
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF]">
              NO SE ENCONTRARON PEDIDOS
            </h3>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">
              {filtroEstado !== "TODOS"
                ? `No existen órdenes de compra registradas con estado "${filtroEstado}".`
                : "Aún no se han generado pedidos con la sesión actual en Django REST Framework."}
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" href="/carrito" className="text-xs">
              REALIZAR PRIMER PEDIDO →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
