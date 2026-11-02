"use client";
// Client Component: pestaña interactiva de gestión y moderación de reseñas con modales de alta, edición y baja.

import { useState } from "react";
import { api } from "../lib/api";
import { formatFecha } from "../lib/formatters";
import { PRODUCTOS_CATALOGO } from "../lib/mockCatalog";
import Badge from "./Badge";
import Button from "./Button";
import Modal from "./Modal";

export default function ResenasCrudTab({
  resenas,
  setResenas,
  loading,
  loadResenas,
  token,
  puedePublicarResenas,
  setFeedback,
}) {
  // 1. Creación de Reseña
  const [isCreateResenaOpen, setIsCreateResenaOpen] = useState(false);
  const [newResenaProducto, setNewResenaProducto] = useState(6);
  const [newResenaCalificacion, setNewResenaCalificacion] = useState(5);
  const [newResenaComentario, setNewResenaComentario] = useState("");

  // 2. Edición de Reseña
  const [editingResena, setEditingResena] = useState(null);
  const [editResenaCalificacion, setEditResenaCalificacion] = useState(5);
  const [editResenaComentario, setEditResenaComentario] = useState("");

  // 3. Eliminación de Reseña
  const [deletingResena, setDeletingResena] = useState(null);

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

  return (
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
                {formatFecha(r.creado_en)}
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
