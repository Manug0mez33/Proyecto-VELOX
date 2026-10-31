"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api, ApiError } from "../lib/api";
import Badge from "./Badge";
import Button from "./Button";
import Modal from "./Modal";

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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fechaStr;
  }
}

export default function PedidoDetalleClient({ id }) {
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Estados del modal y de cancelación
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const syncToken = () => {
      try {
        const storedToken = localStorage.getItem("velox_access_token");
        setToken(storedToken || null);
      } catch {
        setToken(null);
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

  const fetchPedido = useCallback(async () => {
    setLoading(true);
    setError(null);

    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

    try {
      const data = await api.get(`/pedidos/${id}/`, {
        token: currentToken || undefined,
      });
      setPedido(data);
    } catch (err) {
      setError(err.message || `No se pudo obtener el pedido #${id}.`);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchPedido();
  }, [fetchPedido]);

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setActionError(null);
    setActionSuccess(null);

    const currentToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

    try {
      const response = await api.post(
        `/pedidos/${id}/cancelar_pedido/`,
        {},
        { token: currentToken || undefined }
      );

      if (response?.pedido) {
        setPedido(response.pedido);
      } else {
        setPedido((prev) =>
          prev ? { ...prev, estado: "CANCELADO", estado_display: "Cancelado" } : null
        );
      }

      setActionSuccess(
        response?.detail ||
          `Pedido #${id} cancelado correctamente. Las unidades han sido devueltas al inventario.`
      );
      setIsCancelModalOpen(false);
    } catch (err) {
      setActionError(
        err.message || "Ocurrió un error al intentar cancelar el pedido."
      );
    } finally {
      setIsCancelling(false);
    }
  };

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

  const puedeCancelar =
    pedido &&
    pedido.estado !== "CANCELADO" &&
    pedido.estado !== "ENVIADO" &&
    pedido.estado !== "ENTREGADO";

  return (
    <div className="space-y-6">
      {/* 1. Barra de Navegación / Migas de Pan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-5">
        <div className="space-y-1">
          <Link
            href="/dashboard/pedidos"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9CA3AF] hover:text-[#39FF14] transition-colors"
          >
            ← VOLVER AL LISTADO DE PEDIDOS
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FFFFFF]">
              ORDEN DE COMPRA #{id}
            </h2>
            {pedido && renderBadgeEstado(pedido.estado, pedido.estado_display)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchPedido}
            disabled={loading}
            className="text-xs py-2 px-3"
          >
            {loading ? "ACTUALIZANDO..." : "↻ ACTUALIZAR"}
          </Button>

          {puedeCancelar && (
            <Button
              variant="danger"
              onClick={() => setIsCancelModalOpen(true)}
              className="text-xs py-2 px-4 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
            >
              CANCELAR PEDIDO
            </Button>
          )}
        </div>
      </div>

      {/* 2. Feedback de Éxito o Error de Acción */}
      {actionSuccess && (
        <div className="rounded-xl bg-[#182914] border border-[#39FF14] p-4 text-xs text-[#39FF14] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">✓</span>
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-xs text-[#9CA3AF] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl bg-[#2A1515] border border-[#EF4444] p-4 text-xs text-[#FCA5A5] flex items-center justify-between gap-4">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-[#9CA3AF] hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Estado de Carga */}
      {loading && (
        <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-8 space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/3 rounded bg-[#2A2A2A]" />
            <div className="h-24 w-full rounded bg-[#222222]" />
            <div className="h-32 w-full rounded bg-[#222222]" />
          </div>
        </div>
      )}

      {/* 4. Error al cargar pedido */}
      {!loading && error && (
        <div className="rounded-xl bg-[#2A1515] border border-[#EF4444] p-8 text-center space-y-4">
          <div className="text-3xl">⚠️</div>
          <h3 className="font-heading text-lg font-bold uppercase text-[#FFFFFF]">
            NO SE PUDO CARGAR EL PEDIDO #{id}
          </h3>
          <p className="text-xs text-[#FCA5A5] max-w-md mx-auto">{error}</p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="secondary" href="/dashboard/pedidos" className="text-xs">
              VOLVER AL LISTADO
            </Button>
            {(!token || (error && error.toLowerCase().includes("sesión"))) ? (
              <Button variant="primary" href="/login" className="text-xs">
                INICIAR SESIÓN
              </Button>
            ) : (
              <Button variant="primary" onClick={fetchPedido} className="text-xs">
                REINTENTAR
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 5. Contenido del Pedido */}
      {!loading && pedido && (
        <div className="space-y-6">
          {pedido.estado === "CANCELADO" && (
            <div className="rounded-xl bg-[#2A1515] border border-[#EF4444]/60 p-4 text-xs text-[#FCA5A5] flex items-center gap-3">
              <span className="text-base">🚫</span>
              <span>
                <strong>PEDIDO CANCELADO:</strong> Esta compra fue cancelada y los productos regresaron al stock disponible.
              </span>
            </div>
          )}

          {pedido.estado === "ENVIADO" && (
            <div className="rounded-xl bg-[#1E293B] border border-[#0284C7] p-4 text-xs text-[#38BDF8] flex items-center gap-3">
              <span className="text-base">🚚</span>
              <span>
                <strong>PEDIDO EN TRÁNSITO:</strong> El paquete está en camino hacia la dirección de entrega indicada.
              </span>
            </div>
          )}

          {/* Cuadrícula de Información General */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Datos del Cliente */}
            <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
                <span className="text-base">👤</span>
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                  DATOS DEL CLIENTE
                </h3>
              </div>
              <div className="text-xs space-y-1.5 text-[#D1D5DB]">
                <p>
                  <strong className="text-[#9CA3AF]">Usuario:</strong>{" "}
                  <span className="text-[#FFFFFF] font-mono">
                    {pedido.usuario?.username || "cliente"}
                  </span>
                </p>
                <p>
                  <strong className="text-[#9CA3AF]">Email:</strong>{" "}
                  <span className="text-[#FFFFFF]">
                    {pedido.usuario?.email || "cliente@velox.com.ar"}
                  </span>
                </p>
                <p>
                  <strong className="text-[#9CA3AF]">Cuenta:</strong>{" "}
                  <Badge variant="outline" className="text-[10px] ml-1">
                    {pedido.usuario?.rol || "CLIENTE"}
                  </Badge>
                </p>
              </div>
            </div>

            {/* Dirección de Entrega */}
            <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
                <span className="text-base">📍</span>
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                  LOGÍSTICA Y DESTINO
                </h3>
              </div>
              <div className="text-xs space-y-1.5 text-[#D1D5DB]">
                <p className="leading-relaxed">
                  <strong className="text-[#9CA3AF]">Dirección:</strong>{" "}
                  <span className="text-[#FFFFFF]">
                    {pedido.direccion_envio || "Punto de entrega oficial VELOX"}
                  </span>
                </p>
                <p>
                  <strong className="text-[#9CA3AF]">Servicio:</strong> VELOX Express (24/48 hs)
                </p>
              </div>
            </div>

            {/* Transacción y Pago */}
            <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
                <span className="text-base">💳</span>
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                  INFORMACIÓN DE PAGO
                </h3>
              </div>
              <div className="text-xs space-y-1.5 text-[#D1D5DB]">
                <p>
                  <strong className="text-[#9CA3AF]">Método:</strong>{" "}
                  <span className="text-[#FFFFFF]">
                    {pedido.metodo_pago_display || pedido.metodo_pago}
                  </span>
                </p>
                <p>
                  <strong className="text-[#9CA3AF]">Fecha de compra:</strong>{" "}
                  <span className="text-[#FFFFFF]">
                    {formatFecha(pedido.fecha_creacion)}
                  </span>
                </p>
                <p>
                  <strong className="text-[#9CA3AF]">Actualizado:</strong>{" "}
                  <span className="text-[#FFFFFF]">
                    {formatFecha(pedido.actualizado_en || pedido.fecha_creacion)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Desglose de Artículos */}
          <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] overflow-hidden space-y-4">
            <div className="border-b border-[#2A2A2A] px-6 py-4 bg-[#181818] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#39FF14]" />
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                  DESGLOSE DE ARTÍCULOS EN LA ORDEN
                </h3>
              </div>
              <span className="text-xs text-[#9CA3AF]">
                {(pedido.detalles || []).length} calzado(s)
              </span>
            </div>

            <div className="overflow-x-auto px-6 pb-6">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#2A2A2A] text-[11px] font-heading font-bold uppercase text-[#9CA3AF]">
                  <tr>
                    <th className="pb-3 pr-4">Calzado & Modelo</th>
                    <th className="pb-3 px-4">Referencia SKU</th>
                    <th className="pb-3 px-4">Talle AR</th>
                    <th className="pb-3 px-4">Color</th>
                    <th className="pb-3 px-4 text-center">Cantidad</th>
                    <th className="pb-3 px-4 text-right">Precio Unitario</th>
                    <th className="pb-3 pl-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {(pedido.detalles || []).map((det) => (
                    <tr key={det.id || det.sku} className="hover:bg-[#252525]/50">
                      <td className="py-3.5 pr-4 font-bold text-[#FFFFFF]">
                        {det.producto_nombre || "Calzado Deportivo"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#39FF14]">
                        {det.sku || `SKU-${det.variante}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="default">{det.talle_detalle || "Talle AR"}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {det.color_hex && (
                            <span
                              className="h-3 w-3 rounded-full border border-[#444444]"
                              style={{ backgroundColor: det.color_hex }}
                            />
                          )}
                          <span>{det.color_nombre || "Estándar"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-white">
                        {det.cantidad}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-white">
                        {formatARS(det.precio_unitario)}
                      </td>
                      <td className="py-3.5 pl-4 text-right font-mono font-bold text-[#39FF14]">
                        {formatARS(det.subtotal || det.precio_unitario * det.cantidad)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[#2A2A2A] bg-[#141414] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <span className="font-heading text-xs font-bold uppercase text-[#9CA3AF]">
                Total de la Compra
              </span>
              <span className="font-heading text-2xl font-extrabold text-[#39FF14]">
                {formatARS(pedido.total)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Cancelación */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={`CANCELAR PEDIDO #${id}`}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isCancelling}
              className="text-xs py-2 px-4"
            >
              CONSERVAR PEDIDO
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="text-xs py-2 px-4"
            >
              {isCancelling ? "CANCELANDO..." : "SÍ, CANCELAR PEDIDO"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {actionError && (
            <div className="rounded-lg bg-[#2A1515] border border-[#EF4444] p-3 text-xs text-[#FCA5A5] leading-relaxed">
              ⚠️ <strong>Error:</strong> {actionError}
            </div>
          )}
          <p className="text-sm text-[#D1D5DB] leading-relaxed">
            ¿Estás seguro de que deseas cancelar la orden de compra{" "}
            <strong className="text-white font-mono">#{id}</strong>?
          </p>

          <div className="rounded-lg bg-[#2A1515] border border-[#EF4444]/60 p-3 text-xs text-[#FCA5A5] space-y-1">
            <p className="font-bold text-white">Aviso:</p>
            <p>Al cancelar la orden, el estado pasará a Cancelado y los productos reservados volverán a estar disponibles en inventario.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
