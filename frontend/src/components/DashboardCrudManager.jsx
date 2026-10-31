"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api, ApiError } from "../lib/api";
import { parseJwt } from "../lib/jwt";
import Badge from "./Badge";
import Button from "./Button";
import Modal from "./Modal";

// Productos base para selectores en formularios
const PRODUCTOS_CATALOGO = [
  { id: 1, nombre: "Air Zoom Pegasus 40" },
  { id: 2, nombre: "Ultraboost Light" },
  { id: 3, nombre: "Gel-Trabuco 12" },
  { id: 4, nombre: "Fuse 3.0" },
  { id: 5, nombre: "LeBron XXI" },
  { id: 6, nombre: "Velox Carbon X" },
  { id: 7, nombre: "Velox Street Run" },
];

const TALLES_BASE = [
  { id: 1, numero: "38 AR" },
  { id: 2, numero: "39 AR" },
  { id: 3, numero: "40 AR" },
  { id: 4, numero: "41 AR" },
  { id: 5, numero: "42 AR" },
  { id: 6, numero: "43 AR" },
];

const COLORES_BASE = [
  { id: 1, nombre: "Negro", hex: "#121212" },
  { id: 2, nombre: "Blanco", hex: "#FFFFFF" },
  { id: 3, nombre: "Verde Neón", hex: "#39FF14" },
  { id: 4, nombre: "Gris Carbón", hex: "#4B5563" },
  { id: 5, nombre: "Azul", hex: "#2563EB" },
];

// Datos iniciales de demostración para el inventario
export const SAMPLE_VARIANTES = [
  {
    id: 44,
    sku: "VX-VCX-39-NEG",
    producto: 6,
    producto_nombre: "Velox Carbon X",
    talle: 2,
    talle_detalle: "39 AR",
    color: 1,
    color_nombre: "Negro",
    stock: 12,
    precio_ajustado: null,
    precio_final: "249999.00",
    activo: true,
  },
  {
    id: 54,
    sku: "VX-VSR-38-BLA",
    producto: 7,
    producto_nombre: "Velox Street Run",
    talle: 1,
    talle_detalle: "38 AR",
    color: 2,
    color_nombre: "Blanco",
    stock: 8,
    precio_ajustado: null,
    precio_final: "99999.00",
    activo: true,
  },
  {
    id: 49,
    sku: "VX-VSR-38-GRI",
    producto: 7,
    producto_nombre: "Velox Street Run",
    talle: 1,
    talle_detalle: "38 AR",
    color: 4,
    color_nombre: "Gris Carbón",
    stock: 5,
    precio_ajustado: null,
    precio_final: "99999.00",
    activo: true,
  },
];

const SAMPLE_RESENAS = [
  {
    id: 101,
    usuario: 1,
    usuario_nombre: "atleta_maraton",
    producto: 6,
    producto_nombre: "Velox Carbon X",
    calificacion: 5,
    comentario: "Excelente retorno de energía con la placa de carbono en 21K.",
    creado_en: "2026-10-30T14:30:00Z",
  },
  {
    id: 102,
    usuario: 2,
    usuario_nombre: "corredor_trail",
    producto: 3,
    producto_nombre: "Gel-Trabuco 12",
    calificacion: 4,
    comentario: "Gran tracción en senderos de barro y piedra suelta.",
    creado_en: "2026-10-29T18:00:00Z",
  },
];

function formatARS(valor) {
  const num = Number(valor) || 0;
  return `$${num.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export default function DashboardCrudManager({ onVariantesChange } = {}) {
  const [tabActiva, setTabActiva] = useState("variantes"); // "variantes" | "resenas"
  const [token, setToken] = useState(null);

  // Estados de datos
  const [variantes, setVariantes] = useState(SAMPLE_VARIANTES);
  // Arranca vacío: las reseñas reales se piden al montar (antes la solapa mostraba las 2 de ejemplo).
  const [resenas, setResenas] = useState([]);
  const [resenasCargadas, setResenasCargadas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState("");

  // Modales
  // 1. Edición de Variante
  const [editingVariante, setEditingVariante] = useState(null);
  const [editVarianteStock, setEditVarianteStock] = useState("");
  const [editVariantePrecio, setEditVariantePrecio] = useState("");
  const [editVarianteActivo, setEditVarianteActivo] = useState(true);

  // 2. Creación de Variante
  const [isCreateVarianteOpen, setIsCreateVarianteOpen] = useState(false);
  const [createVarianteError, setCreateVarianteError] = useState(null);
  const [isSubmittingVariante, setIsSubmittingVariante] = useState(false);
  const [newVarProducto, setNewVarProducto] = useState(6);
  const [newVarTalle, setNewVarTalle] = useState(3);
  const [newVarColor, setNewVarColor] = useState(3);
  const [newVarSku, setNewVarSku] = useState("");
  const [newVarStock, setNewVarStock] = useState("10");
  const [newVarPrecio, setNewVarPrecio] = useState("");

  // 3. Eliminación de Variante
  const [deletingVariante, setDeletingVariante] = useState(null);
  const [deleteVarianteError, setDeleteVarianteError] = useState(null);
  const [isDeletingVariante, setIsDeletingVariante] = useState(false);

  // 4. Creación de Reseña
  const [isCreateResenaOpen, setIsCreateResenaOpen] = useState(false);
  const [newResenaProducto, setNewResenaProducto] = useState(6);
  const [newResenaCalificacion, setNewResenaCalificacion] = useState(5);
  const [newResenaComentario, setNewResenaComentario] = useState("");

  // 5. Edición de Reseña
  const [editingResena, setEditingResena] = useState(null);
  const [editResenaCalificacion, setEditResenaCalificacion] = useState(5);
  const [editResenaComentario, setEditResenaComentario] = useState("");

  // 6. Eliminación de Reseña
  const [deletingResena, setDeletingResena] = useState(null);

  // Sincronizar token reactivamente con localStorage
  useEffect(() => {
    const syncToken = () => {
      try {
        const stored = localStorage.getItem("velox_access_token");
        setToken(stored || null);
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

  // Cargar Variantes desde API
  const loadVariantes = useCallback(async () => {
    setLoading(true);
    try {
      // page_size=100: sin esto la API devuelve solo las primeras 10 variantes del inventario.
      const res = await api.getPaginated("/variantes/", { params: { page_size: 100 } });
      // Los datos de ejemplo quedan solo si la API no responde (catch).
      setVariantes(res.results);
    } catch (err) {
      console.warn("No se pudo sincronizar inventario con el servidor:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar Reseñas desde API
  const loadResenas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPaginated("/resenas/", { params: { page_size: 100 } });
      const items = res?.results || (Array.isArray(res) ? res : []);
      if (Array.isArray(items)) {
        const enriched = items.map((r) => ({
          ...r,
          producto_nombre:
            r.producto_nombre ||
            PRODUCTOS_CATALOGO.find((p) => p.id === r.producto)?.nombre ||
            `Calzado #${r.producto}`,
        }));
        setResenas(enriched);
      }
    } catch (err) {
      console.warn("No se pudieron cargar reseñas del servidor:", err);
      // Solo si la API no responde se muestran las reseñas de ejemplo.
      setResenas(SAMPLE_RESENAS);
    } finally {
      setResenasCargadas(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tabActiva === "variantes") {
      loadVariantes();
    } else {
      loadResenas();
    }
  }, [tabActiva, loadVariantes, loadResenas]);

  // Las reseñas también se cargan al abrir el panel, para que el contador de la solapa sea real desde el inicio.
  useEffect(() => {
    loadResenas();
  }, [loadResenas]);

  // El EMPLEADO modera reseñas (editar/eliminar) pero no publica nuevas (el backend también lo bloquea).
  const puedePublicarResenas = parseJwt(token)?.rol !== "EMPLEADO";

  // Limpiar feedback tras 5 segundos
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Sincronizar inventario con el componente padre
  useEffect(() => {
    if (typeof onVariantesChange === "function") {
      onVariantesChange(variantes);
    }
  }, [variantes, onVariantesChange]);

  // Abrir modal de edición
  const handleOpenEditVariante = (variante) => {
    setEditingVariante(variante);
    setEditVarianteStock(String(variante.stock));
    setEditVariantePrecio(variante.precio_ajustado ? String(variante.precio_ajustado) : "");
    setEditVarianteActivo(Boolean(variante.activo));
  };

  // Guardar edición de variante
  const handleSaveVariantePatch = async (e) => {
    e.preventDefault();
    if (!editingVariante) return;

    const payload = {
      stock: parseInt(editVarianteStock, 10) || 0,
      activo: editVarianteActivo,
    };
    if (editVariantePrecio.trim()) {
      payload.precio_ajustado = editVariantePrecio.trim();
    } else {
      payload.precio_ajustado = null;
    }

    try {
      const currentToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

      const updatedData = await api.patch(
        `/variantes/${editingVariante.sku}/`,
        payload,
        { token: currentToken || undefined }
      );

      setVariantes((prev) =>
        prev.map((v) =>
          v.sku === editingVariante.sku
            ? { ...v, ...updatedData }
            : v
        )
      );

      setFeedback({
        type: "success",
        message: `✓ Variante ${editingVariante.sku} actualizada con éxito. Nuevo stock: ${payload.stock} u.`,
      });
      setEditingVariante(null);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar la variante.",
      });
    }
  };

  const handleOpenCreateVariante = () => {
    setCreateVarianteError(null);
    setIsCreateVarianteOpen(true);
  };

  const handleCloseCreateVariante = () => {
    setCreateVarianteError(null);
    setIsCreateVarianteOpen(false);
  };

  const handleOpenDeleteVariante = (variante) => {
    setDeleteVarianteError(null);
    setDeletingVariante(variante);
  };

  const handleCloseDeleteVariante = () => {
    setDeleteVarianteError(null);
    setDeletingVariante(null);
  };

  // Crear variante
  const handleCreateVariante = async (e) => {
    e.preventDefault();
    if (!newVarSku.trim()) {
      setCreateVarianteError("El código de referencia SKU es obligatorio.");
      return;
    }

    const payload = {
      producto: Number(newVarProducto),
      talle: Number(newVarTalle),
      color: Number(newVarColor),
      sku: newVarSku.trim().toUpperCase(),
      stock: parseInt(newVarStock, 10) || 0,
      activo: true,
    };
    if (newVarPrecio.trim()) {
      payload.precio_ajustado = newVarPrecio.trim();
    }

    setIsSubmittingVariante(true);
    try {
      const currentToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

      const createdData = await api.post("/variantes/", payload, {
        token: currentToken || undefined,
      });

      setVariantes((prev) => [createdData, ...prev]);
      setFeedback({
        type: "success",
        message: `✓ Nueva variante '${payload.sku}' registrada exitosamente.`,
      });
      setCreateVarianteError(null);
      setIsCreateVarianteOpen(false);
      setNewVarSku("");
      setNewVarStock("10");
      setNewVarPrecio("");
    } catch (err) {
      const errorMsg = err.message || "Error al registrar la variante.";
      setCreateVarianteError(errorMsg);
    } finally {
      setIsSubmittingVariante(false);
    }
  };

  // Eliminar variante
  const handleDeleteVariante = async () => {
    if (!deletingVariante) return;

    setIsDeletingVariante(true);
    try {
      setDeleteVarianteError(null);
      const currentToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

      await api.delete(`/variantes/${deletingVariante.sku}/`, {
        token: currentToken || undefined,
      });

      setVariantes((prev) => prev.filter((v) => v.sku !== deletingVariante.sku));
      setFeedback({
        type: "success",
        message: `✓ Variante ${deletingVariante.sku} eliminada correctamente.`,
      });
      setDeletingVariante(null);
      setDeleteVarianteError(null);
    } catch (err) {
      const errorMsg = err.message || "No se pudo eliminar la variante.";
      setDeleteVarianteError(errorMsg);
    } finally {
      setIsDeletingVariante(false);
    }
  };

  // Crear reseña
  const handleCreateResena = async (e) => {
    e.preventDefault();
    if (!newResenaComentario.trim()) {
      setFeedback({ type: "error", message: "El comentario de la reseña es obligatorio." });
      return;
    }

    const payload = {
      producto: Number(newResenaProducto),
      calificacion: Number(newResenaCalificacion),
      comentario: newResenaComentario.trim(),
    };

    try {
      const currentToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

      const created = await api.post("/resenas/", payload, {
        token: currentToken || undefined,
      });

      setResenas((prev) => [created, ...prev]);
      setFeedback({
        type: "success",
        message: "✓ Reseña registrada exitosamente.",
      });
      setIsCreateResenaOpen(false);
      setNewResenaComentario("");
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Error al publicar la reseña.",
      });
    }
  };

  const handleOpenEditResena = (resena) => {
    setEditingResena(resena);
    setEditResenaCalificacion(resena.calificacion || 5);
    setEditResenaComentario(resena.comentario || "");
  };

  // Guardar edición de reseña
  const handleSaveResenaPatch = async (e) => {
    e.preventDefault();
    if (!editingResena) return;

    const payload = {
      calificacion: Number(editResenaCalificacion),
      comentario: editResenaComentario.trim(),
    };

    try {
      const currentToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

      const updated = await api.patch(`/resenas/${editingResena.id}/`, payload, {
        token: currentToken || undefined,
      });

      setResenas((prev) =>
        prev.map((r) => (r.id === editingResena.id ? { ...r, ...updated } : r))
      );
      setFeedback({
        type: "success",
        message: `✓ Reseña actualizada con éxito.`,
      });
      setEditingResena(null);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar la reseña.",
      });
    }
  };

  // Eliminar reseña
  const handleDeleteResena = async () => {
    if (!deletingResena) return;

    try {
      const currentToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

      await api.delete(`/resenas/${deletingResena.id}/`, {
        token: currentToken || undefined,
      });

      setResenas((prev) => prev.filter((r) => r.id !== deletingResena.id));
      setFeedback({
        type: "success",
        message: `✓ Reseña eliminada correctamente.`,
      });
      setDeletingResena(null);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Error al eliminar la reseña.",
      });
      setDeletingResena(null);
    }
  };

  const variantesFiltradas = useMemo(() => {
    const q = filtroTexto.trim().toLowerCase();
    if (!q) return variantes;
    return variantes.filter(
      (v) =>
        (v.sku || "").toLowerCase().includes(q) ||
        (v.producto_nombre || "").toLowerCase().includes(q) ||
        (v.color_nombre || "").toLowerCase().includes(q) ||
        (v.talle_detalle || "").toLowerCase().includes(q)
    );
  }, [variantes, filtroTexto]);

  return (
    <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-6 space-y-6">
      {/* 1. Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">GESTIÓN DE INVENTARIO</Badge>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase text-[#FFFFFF]">
              ADMINISTRACIÓN DE VARIANTES Y RESEÑAS
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            Control de inventario por talle y color, actualización de existencias y moderación de opiniones.
          </p>
        </div>

        {/* Pestañas */}
        <div className="flex items-center gap-2 bg-[#141414] p-1 rounded-lg border border-[#2A2A2A]">
          <button
            onClick={() => setTabActiva("variantes")}
            className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
              tabActiva === "variantes"
                ? "bg-[#39FF14] text-[#121212]"
                : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            👟 VARIANTES ({variantes.length})
          </button>
          <button
            onClick={() => setTabActiva("resenas")}
            className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
              tabActiva === "resenas"
                ? "bg-[#39FF14] text-[#121212]"
                : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            ★ RESEÑAS ({resenasCargadas ? resenas.length : "…"})
          </button>
        </div>
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div
          className={`rounded-lg p-3.5 text-xs flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-[#182914] border border-[#39FF14] text-[#39FF14]"
              : "bg-[#2A1515] border border-[#EF4444] text-[#FCA5A5]"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECCIÓN 1: VARIANTES DE CALZADO */}
      {/* ========================================================= */}
      {tabActiva === "variantes" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Filtrar por SKU, modelo o color..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                className="w-full rounded-lg bg-[#141414] border border-[#2A2A2A] px-3.5 py-2 text-xs text-white placeholder-[#6B7280] focus:border-[#39FF14] focus:outline-none"
              />
              {filtroTexto && (
                <button
                  onClick={() => setFiltroTexto("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={loadVariantes}
                disabled={loading}
                className="text-xs py-2 px-3"
              >
                {loading ? "CARGANDO..." : "↻ ACTUALIZAR"}
              </Button>
              <Button
                variant="primary"
                onClick={handleOpenCreateVariante}
                className="text-xs py-2 px-3"
              >
                + NUEVA VARIANTE
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#2A2A2A] bg-[#181818] text-[11px] font-heading font-bold uppercase text-[#9CA3AF]">
                <tr>
                  <th className="py-3 px-4">Referencia SKU</th>
                  <th className="py-3 px-4">Calzado</th>
                  <th className="py-3 px-4">Talle AR</th>
                  <th className="py-3 px-4">Color</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Precio Final</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A] bg-[#141414]">
                {variantesFiltradas.map((v) => (
                  <tr key={v.sku} className="hover:bg-[#202020]/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#39FF14]">
                      {v.sku}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {v.producto_nombre || `Producto #${v.producto}`}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="default">{v.talle_detalle || `${v.talle} AR`}</Badge>
                    </td>
                    <td className="py-3 px-4 text-[#D1D5DB]">
                      {v.color_nombre || "Color"}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                          v.stock > 5
                            ? "bg-[#182914] text-[#39FF14]"
                            : v.stock > 0
                            ? "bg-[#332510] text-[#FBBF24]"
                            : "bg-[#2A1515] text-[#EF4444]"
                        }`}
                      >
                        {v.stock} u.
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-white">
                      {formatARS(v.precio_final)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditVariante(v)}
                        className="rounded bg-[#2A2A2A] px-2.5 py-1 text-[11px] font-heading font-bold uppercase text-white hover:bg-[#39FF14] hover:text-[#121212] transition-colors"
                      >
                        EDITAR
                      </button>
                      <button
                        onClick={() => handleOpenDeleteVariante(v)}
                        className="rounded bg-[#2A1515] border border-[#EF4444]/40 px-2.5 py-1 text-[11px] font-heading font-bold uppercase text-[#F87171] hover:bg-[#EF4444] hover:text-white transition-colors"
                      >
                        ELIMINAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECCIÓN 2: RESEÑAS DE CLIENTES */}
      {/* ========================================================= */}
      {tabActiva === "resenas" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#9CA3AF]">
              Publicación y moderación de opiniones de compradores de calzado.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={loadResenas}
                disabled={loading}
                className="text-xs py-2 px-3"
              >
                {loading ? "CARGANDO..." : "↻ ACTUALIZAR"}
              </Button>
              {puedePublicarResenas && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateResenaOpen(true)}
                  className="text-xs py-2 px-3"
                >
                  + NUEVA RESEÑA
                </Button>
              )}
            </div>
          </div>

          {/* Grilla de Reseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resenas.map((r) => (
              <div
                key={r.id}
                className="rounded-lg bg-[#141414] border border-[#2A2A2A] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">
                      {r.producto_nombre || `Calzado #${r.producto}`}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {r.usuario_nombre || "Cliente"}
                    </Badge>
                  </div>
                  <div className="flex items-center text-[#FBBF24] text-xs">
                    {"★".repeat(r.calificacion || 5)}
                    {"☆".repeat(5 - (r.calificacion || 5))}
                  </div>
                </div>

                <p className="text-xs text-[#D1D5DB] leading-relaxed italic">
                  &ldquo;{r.comentario}&rdquo;
                </p>

                <div className="border-t border-[#2A2A2A] pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-[#6B7280]">
                    {r.creado_en ? new Date(r.creado_en).toLocaleDateString("es-AR") : "Reciente"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditResena(r)}
                      className="rounded bg-[#2A2A2A] px-2.5 py-1 text-[11px] font-heading font-bold uppercase text-white hover:bg-[#39FF14] hover:text-[#121212] transition-colors"
                    >
                      EDITAR
                    </button>
                    <button
                      onClick={() => setDeletingResena(r)}
                      className="rounded bg-[#2A1515] border border-[#EF4444]/40 px-2.5 py-1 text-[11px] font-heading font-bold uppercase text-[#F87171] hover:bg-[#EF4444] hover:text-white transition-colors"
                    >
                      ELIMINAR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALES */}
      {/* ========================================================= */}

      {/* Modal 1: Edición de Variante */}
      <Modal
        isOpen={Boolean(editingVariante)}
        onClose={() => setEditingVariante(null)}
        title={`EDITAR VARIANTE SKU: ${editingVariante?.sku}`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditingVariante(null)}
              className="text-xs py-2 px-3"
            >
              CANCELAR
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveVariantePatch}
              className="text-xs py-2 px-3"
            >
              GUARDAR CAMBIOS
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveVariantePatch} className="space-y-4">
          <div>
            <label htmlFor="editVarianteStock" className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
              Stock en Depósito (Unidades)
            </label>
            <input
              id="editVarianteStock"
              type="number"
              min="0"
              value={editVarianteStock}
              onChange={(e) => setEditVarianteStock(e.target.value)}
              className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="editVariantePrecio" className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
              Precio Ajustado ARS (Opcional — Vacío usa precio base del producto)
            </label>
            <input
              id="editVariantePrecio"
              type="number"
              step="0.01"
              placeholder="ej. 249999.00"
              value={editVariantePrecio}
              onChange={(e) => setEditVariantePrecio(e.target.value)}
              className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editVarianteActivo"
              checked={editVarianteActivo}
              onChange={(e) => setEditVarianteActivo(e.target.checked)}
              className="rounded border-[#2A2A2A] text-[#39FF14] focus:ring-[#39FF14]"
            />
            <label htmlFor="editVarianteActivo" className="text-xs text-white font-medium">
              Variante activa para venta en catálogo
            </label>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Creación de Variante */}
      <Modal
        isOpen={isCreateVarianteOpen}
        onClose={handleCloseCreateVariante}
        title="ALTA DE NUEVA VARIANTE SKU"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleCloseCreateVariante}
              className="text-xs py-2 px-3"
            >
              CANCELAR
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateVariante}
              disabled={isSubmittingVariante}
              className="text-xs py-2 px-3"
            >
              {isSubmittingVariante ? "CREANDO..." : "CREAR VARIANTE"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {createVarianteError && (
            <div
              role="alert"
              className="rounded-lg bg-[#2A1515] border border-[#EF4444] p-3 text-xs text-[#FCA5A5] flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm font-bold text-[#EF4444] leading-none mt-0.5">⚠</span>
                <span className="leading-relaxed">{createVarianteError}</span>
              </div>
              <button
                type="button"
                onClick={() => setCreateVarianteError(null)}
                className="text-xs text-[#9CA3AF] hover:text-white font-bold ml-2"
                aria-label="Cerrar alerta de error"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleCreateVariante} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
                Producto / Modelo
              </label>
              <select
                value={newVarProducto}
                onChange={(e) => {
                  setNewVarProducto(e.target.value);
                  if (createVarianteError) setCreateVarianteError(null);
                }}
                className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
              >
                {PRODUCTOS_CATALOGO.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
                  Talle AR
                </label>
                <select
                  value={newVarTalle}
                  onChange={(e) => {
                    setNewVarTalle(e.target.value);
                    if (createVarianteError) setCreateVarianteError(null);
                  }}
                  className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
                >
                  {TALLES_BASE.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.numero}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
                  Color
                </label>
                <select
                  value={newVarColor}
                  onChange={(e) => {
                    setNewVarColor(e.target.value);
                    if (createVarianteError) setCreateVarianteError(null);
                  }}
                  className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
                >
                  {COLORES_BASE.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
                Código de Referencia SKU
              </label>
              <input
                type="text"
                placeholder="ej. VX-VCX-41-NEO"
                value={newVarSku}
                onChange={(e) => {
                  setNewVarSku(e.target.value);
                  if (createVarianteError) setCreateVarianteError(null);
                }}
                className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white font-mono focus:border-[#39FF14] focus:outline-none uppercase"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
                  Stock Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVarStock}
                  onChange={(e) => {
                    setNewVarStock(e.target.value);
                    if (createVarianteError) setCreateVarianteError(null);
                  }}
                  className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
                  Precio Ajustado (Opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ej. 219999.00"
                  value={newVarPrecio}
                  onChange={(e) => {
                    setNewVarPrecio(e.target.value);
                    if (createVarianteError) setCreateVarianteError(null);
                  }}
                  className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal 3: Confirmación de Eliminación de Variante */}
      <Modal
        isOpen={Boolean(deletingVariante)}
        onClose={handleCloseDeleteVariante}
        title={`ELIMINAR VARIANTE ${deletingVariante?.sku}`}
        footer={
          deleteVarianteError ? (
            <Button
              variant="secondary"
              onClick={handleCloseDeleteVariante}
              className="text-xs py-2 px-3"
            >
              ENTENDIDO / CERRAR
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={handleCloseDeleteVariante}
                className="text-xs py-2 px-3"
              >
                CANCELAR
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteVariante}
                disabled={isDeletingVariante}
                className="text-xs py-2 px-3"
              >
                {isDeletingVariante ? "ELIMINANDO..." : "CONFIRMAR ELIMINACIÓN"}
              </Button>
            </>
          )
        }
      >
        <div className="space-y-4">
          {deleteVarianteError && (
            <div
              role="alert"
              className="rounded-lg bg-[#2A1515] border border-[#EF4444] p-3 text-xs text-[#FCA5A5] flex items-start gap-2.5"
            >
              <span className="text-base font-bold text-[#EF4444] leading-none mt-0.5">⚠</span>
              <div className="space-y-1">
                <p className="font-bold text-[#EF4444] uppercase tracking-wide">
                  No se pudo eliminar la variante
                </p>
                <p className="leading-relaxed">{deleteVarianteError}</p>
              </div>
            </div>
          )}

          {!deleteVarianteError ? (
            <p className="text-xs text-[#D1D5DB] leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente la variante{" "}
              <strong className="text-white font-mono">{deletingVariante?.sku}</strong>?
            </p>
          ) : (
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Las variantes que ya cuentan con pedidos históricos asociados quedan protegidas para garantizar la integridad de compras previas.
            </p>
          )}
        </div>
      </Modal>

      {/* Modal 4: Creación de Reseña */}
      <Modal
        isOpen={isCreateResenaOpen}
        onClose={() => setIsCreateResenaOpen(false)}
        title="PUBLICAR RESEÑA DE ATLETA"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsCreateResenaOpen(false)}
              className="text-xs py-2 px-3"
            >
              CANCELAR
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateResena}
              className="text-xs py-2 px-3"
            >
              PUBLICAR RESEÑA
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateResena} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
              Calzado Evaluado
            </label>
            <select
              value={newResenaProducto}
              onChange={(e) => setNewResenaProducto(e.target.value)}
              className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
            >
              {PRODUCTOS_CATALOGO.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
              Calificación (1 a 5 Estrellas)
            </label>
            <select
              value={newResenaCalificacion}
              onChange={(e) => setNewResenaCalificacion(e.target.value)}
              className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
            >
              <option value={5}>★★★★★ (5 Estrellas - Rendimiento Máximo)</option>
              <option value={4}>★★★★☆ (4 Estrellas - Muy Bueno)</option>
              <option value={3}>★★★☆☆ (3 Estrellas - Bueno)</option>
              <option value={2}>★★☆☆☆ (2 Estrellas - Regular)</option>
              <option value={1}>★☆☆☆☆ (1 Estrella - Deficiente)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
              Testimonio / Comentario
            </label>
            <textarea
              rows={3}
              placeholder="Describí tu experiencia sobre amortiguación, respuesta y talle..."
              value={newResenaComentario}
              onChange={(e) => setNewResenaComentario(e.target.value)}
              className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Modal 5: Edición de Reseña */}
      <Modal
        isOpen={Boolean(editingResena)}
        onClose={() => setEditingResena(null)}
        title="EDITAR RESEÑA"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditingResena(null)}
              className="text-xs py-2 px-3"
            >
              CANCELAR
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveResenaPatch}
              className="text-xs py-2 px-3"
            >
              GUARDAR CAMBIOS
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveResenaPatch} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
              Calificación (1 a 5)
            </label>
            <select
              value={editResenaCalificacion}
              onChange={(e) => setEditResenaCalificacion(e.target.value)}
              className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
            >
              <option value={5}>★★★★★ (5 Estrellas)</option>
              <option value={4}>★★★★☆ (4 Estrellas)</option>
              <option value={3}>★★★☆☆ (3 Estrellas)</option>
              <option value={2}>★★☆☆☆ (2 Estrellas)</option>
              <option value={1}>★☆☆☆☆ (1 Estrella)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#D1D5DB] mb-1">
              Comentario
            </label>
            <textarea
              rows={3}
              value={editResenaComentario}
              onChange={(e) => setEditResenaComentario(e.target.value)}
              className="w-full rounded bg-[#121212] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:border-[#39FF14] focus:outline-none"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Modal 6: Eliminación de Reseña */}
      <Modal
        isOpen={Boolean(deletingResena)}
        onClose={() => setDeletingResena(null)}
        title="ELIMINAR RESEÑA"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeletingResena(null)}
              className="text-xs py-2 px-3"
            >
              CANCELAR
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteResena}
              className="text-xs py-2 px-3"
            >
              CONFIRMAR ELIMINACIÓN
            </Button>
          </>
        }
      >
        <p className="text-xs text-[#D1D5DB] leading-relaxed">
          ¿Confirmás la eliminación permanente de la reseña seleccionada?
        </p>
      </Modal>
    </div>
  );
}
