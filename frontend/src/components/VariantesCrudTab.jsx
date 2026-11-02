"use client";
// Client Component: pestaña interactiva de gestión de variantes SKU con filtros y modales de alta, edición y baja.

import { useState, useMemo } from "react";
import { api } from "../lib/api";
import { formatARS } from "../lib/formatters";
import { PRODUCTOS_CATALOGO, TALLES_BASE, COLORES_BASE } from "../lib/mockCatalog";
import Badge from "./Badge";
import Button from "./Button";
import Modal from "./Modal";

export default function VariantesCrudTab({
  variantes,
  setVariantes,
  loading,
  loadVariantes,
  token,
  setFeedback,
}) {
  const [filtroTexto, setFiltroTexto] = useState("");

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

  const handleOpenEditVariante = (variante) => {
    setEditingVariante(variante);
    setEditVarianteStock(String(variante.stock));
    setEditVariantePrecio(variante.precio_ajustado ? String(variante.precio_ajustado) : "");
    setEditVarianteActivo(Boolean(variante.activo));
  };

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
          v.sku === editingVariante.sku ? { ...v, ...updatedData } : v
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

  return (
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
    </div>
  );
}
