"use client";
// Client Component ("use client"): lee el JWT del cliente desde localStorage, consulta GET /api/pedidos/ (el backend devuelve solo sus pedidos) y permite cancelarlos con onClick.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import Badge from "../../components/Badge";
import Button from "../../components/Button";

// Recorrido normal de un pedido; CANCELADO se muestra aparte.
const PASOS_SEGUIMIENTO = [
  { estado: "PENDIENTE", label: "Recibido" },
  { estado: "PAGADO", label: "Pago confirmado" },
  { estado: "ENVIADO", label: "En camino" },
  { estado: "ENTREGADO", label: "Entregado" },
];

// Mismas reglas que la @action cancelar_pedido del backend.
const ESTADOS_CANCELABLES = ["PENDIENTE", "PAGADO"];

function formatARS(valor) {
  const num = Number(valor) || 0;
  return `$${num.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

function formatFecha(fechaStr) {
  const d = fechaStr ? new Date(fechaStr) : null;
  return d && !isNaN(d.getTime())
    ? d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
    : "";
}

function Seguimiento({ estado }) {
  if (estado === "CANCELADO") {
    return (
      <div className="rounded-lg bg-[#2A1515] border border-[#7F1D1D] p-3 text-xs text-[#FCA5A5]">
        Este pedido fue cancelado y las unidades volvieron al inventario.
      </div>
    );
  }

  const pasoActual = PASOS_SEGUIMIENTO.findIndex((p) => p.estado === estado);

  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Seguimiento del pedido">
      {PASOS_SEGUIMIENTO.map((paso, i) => {
        const completo = i <= pasoActual;
        return (
          <li key={paso.estado} className="space-y-1.5">
            <div className={`h-1.5 rounded-full ${completo ? "bg-[#39FF14]" : "bg-[#2A2A2A]"}`} />
            <p
              className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                i === pasoActual ? "text-[#39FF14]" : completo ? "text-[#FFFFFF]" : "text-[#6B7280]"
              }`}
              aria-current={i === pasoActual ? "step" : undefined}
            >
              {paso.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export default function MisPedidosPage() {
  const [token, setToken] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [confirmandoId, setConfirmandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const cargarPedidos = useCallback(async (tokenActual) => {
    setCargando(true);
    try {
      // El backend filtra por request.user: un CLIENTE solo recibe sus propios pedidos.
      const data = await api.getPaginated("/pedidos/", {
        token: tokenActual,
        params: { page_size: 50 },
      });
      setPedidos(data.results);
      setError("");
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus pedidos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem("velox_access_token");
    } catch {
      // Navegador sin localStorage disponible
    }
    setToken(stored);
    if (stored) {
      cargarPedidos(stored);
    } else {
      setCargando(false);
    }
  }, [cargarPedidos]);

  const handleCancelar = async (id) => {
    setMensaje("");
    setError("");
    try {
      const respuesta = await api.post(`/pedidos/${id}/cancelar_pedido/`, {}, { token });
      setPedidos((prev) => prev.map((p) => (p.id === id ? respuesta.pedido : p)));
      setMensaje(respuesta.detail);
    } catch (err) {
      setError(err.message || "No se pudo cancelar el pedido.");
    } finally {
      setConfirmandoId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] px-6 lg:px-20 py-10 space-y-8">
      <div className="border-b border-[#2A2A2A] pb-6 space-y-2">
        <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
          MI CUENTA
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold uppercase text-[#FFFFFF]">
          MIS PEDIDOS
        </h1>
        <p className="text-sm text-[#D1D5DB]">
          Seguí el estado de tus compras, desde que las recibimos hasta que llegan a tu casa.
        </p>
      </div>

      {mensaje && (
        <div className="rounded-lg bg-[#1D2B1A] border border-[#39FF14] p-3 text-xs text-[#39FF14]">
          {mensaje}
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-lg bg-[#2A1515] border border-[#EF4444] p-3 text-xs text-[#FCA5A5]">
          {error}
        </div>
      )}

      {cargando && <p className="text-sm text-[#9CA3AF]">Cargando tus pedidos...</p>}

      {!cargando && !token && (
        <p className="text-sm text-[#D1D5DB]">
          <Link href="/login?redirect=/mis-pedidos" className="font-bold text-[#39FF14] hover:underline">
            Iniciá sesión
          </Link>{" "}
          para ver tus pedidos.
        </p>
      )}

      {!cargando && token && !error && pedidos.length === 0 && (
        <div className="rounded-xl bg-[#2A2A2A] border border-[#383838] p-10 text-center space-y-4">
          <p className="font-heading text-xl font-bold uppercase text-[#FFFFFF]">
            TODAVÍA NO HICISTE PEDIDOS
          </p>
          <Button variant="primary" href="/productos">
            EXPLORAR CATÁLOGO →
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {pedidos.map((pedido) => (
          <article
            key={pedido.id}
            className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 sm:p-6 space-y-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-extrabold text-[#FFFFFF]">
                  PEDIDO VLX-PED-{pedido.id}
                </h2>
                <p className="text-xs text-[#9CA3AF]">Realizado el {formatFecha(pedido.fecha_creacion)}</p>
              </div>
              <Badge variant={pedido.estado === "CANCELADO" ? "danger" : "outline"}>
                {pedido.estado_display || pedido.estado}
              </Badge>
            </div>

            <Seguimiento estado={pedido.estado} />

            {/* Artículos con precio unitario y subtotal */}
            <ul className="divide-y divide-[#2A2A2A] rounded-lg border border-[#2A2A2A] bg-[#141414]">
              {(pedido.detalles || []).map((det) => (
                <li key={det.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#FFFFFF]">{det.producto_nombre}</p>
                    <p className="text-[#9CA3AF]">
                      Talle {det.talle_detalle} • {det.color_nombre} •{" "}
                      <span className="font-heading text-[#39FF14]">{det.sku}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-[#FFFFFF]">{formatARS(det.subtotal)}</p>
                    <p className="text-[#9CA3AF]">
                      {det.cantidad} × {formatARS(det.precio_unitario)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-end justify-between gap-4 text-xs">
              <div className="space-y-1 text-[#D1D5DB]">
                <p>Envío a: {pedido.direccion_envio || "—"}</p>
                <p>Pago: {pedido.metodo_pago_display || pedido.metodo_pago}</p>
              </div>
              <p className="font-heading text-lg font-extrabold text-[#FFFFFF]">
                TOTAL {formatARS(pedido.total)}
              </p>
            </div>

            {ESTADOS_CANCELABLES.includes(pedido.estado) &&
              (confirmandoId === pedido.id ? (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-[#FCA5A5]">¿Seguro que querés cancelar este pedido?</span>
                  <Button variant="danger" className="text-xs py-2 px-4" onClick={() => handleCancelar(pedido.id)}>
                    SÍ, CANCELAR
                  </Button>
                  <Button variant="secondary" className="text-xs py-2 px-4" onClick={() => setConfirmandoId(null)}>
                    NO
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoId(pedido.id)}
                  className="text-xs font-bold uppercase text-[#F87171] hover:underline"
                >
                  Cancelar pedido
                </button>
              ))}
          </article>
        ))}
      </div>
    </div>
  );
}
