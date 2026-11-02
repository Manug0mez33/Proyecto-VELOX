"use client";
// Client Component ("use client"): Gestiona de forma interactiva la carga, publicación (POST), edición (PATCH) y baja (DELETE) de reseñas de atletas para un calzado específico.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Button from "./Button";
import { api } from "../lib/api";
import { formatFecha } from "../lib/formatters";
import { useAuthToken } from "../lib/useAuthToken";

export default function ProductReviewsSection({ productoId }) {
  const { token, userId: usuarioId, rol } = useAuthToken();

  const [resenas, setResenas] = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(true);
  const [errorResenas, setErrorResenas] = useState("");

  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [resenaEnviada, setResenaEnviada] = useState(false);
  const [enviandoResena, setEnviandoResena] = useState(false);

  // Edición y borrado de las reseñas propias
  const [editandoId, setEditandoId] = useState(null);
  const [editCalificacion, setEditCalificacion] = useState(5);
  const [editComentario, setEditComentario] = useState("");
  const [confirmandoBorradoId, setConfirmandoBorradoId] = useState(null);

  const cargarResenas = useCallback(async () => {
    setCargandoResenas(true);
    try {
      const data = await api.getPaginated("/resenas/", {
        params: { producto: productoId, ordering: "-creado_en", page_size: 100 },
      });
      setResenas(data.results);
      setErrorResenas("");
    } catch (err) {
      setErrorResenas(err.message || "No se pudieron cargar las reseñas.");
    } finally {
      setCargandoResenas(false);
    }
  }, [productoId]);

  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);

  const handlePublicarResena = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !token) return;

    setEnviandoResena(true);
    setErrorResenas("");
    try {
      const creada = await api.post(
        "/resenas/",
        {
          producto: productoId,
          calificacion: Number(nuevaCalificacion),
          comentario: nuevoComentario.trim(),
        },
        { token }
      );
      setResenas((prev) => [creada, ...prev]);
      setNuevoComentario("");
      setResenaEnviada(true);
      setTimeout(() => setResenaEnviada(false), 2500);
    } catch (err) {
      setErrorResenas(err.message || "No se pudo publicar la reseña.");
    } finally {
      setEnviandoResena(false);
    }
  };

  const handleEmpezarEdicion = (resena) => {
    setConfirmandoBorradoId(null);
    setEditandoId(resena.id);
    setEditCalificacion(resena.calificacion);
    setEditComentario(resena.comentario);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!editComentario.trim()) return;

    setErrorResenas("");
    try {
      const actualizada = await api.patch(
        `/resenas/${editandoId}/`,
        { calificacion: Number(editCalificacion), comentario: editComentario.trim() },
        { token }
      );
      setResenas((prev) => prev.map((r) => (r.id === editandoId ? actualizada : r)));
      setEditandoId(null);
    } catch (err) {
      setErrorResenas(err.message || "No se pudo editar la reseña.");
    }
  };

  const handleEliminar = async (id) => {
    setErrorResenas("");
    try {
      await api.delete(`/resenas/${id}/`, { token });
      setResenas((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setErrorResenas(err.message || "No se pudo eliminar la reseña.");
    } finally {
      setConfirmandoBorradoId(null);
    }
  };

  return (
    <section className="rounded-xl bg-[#2A2A2A] border border-[#383838] p-6 sm:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#383838] pb-4">
        <div>
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14]">
            VALORACIONES DE ATLETAS
          </span>
          <h2 className="font-heading text-2xl font-bold uppercase text-[#FFFFFF] mt-1">
            OPINIONES Y EXPERIENCIAS EN PISTA
          </h2>
        </div>
        <span className="font-heading text-xs text-[#9CA3AF]">
          {resenas.length} opiniones verificadas
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Listado de Reseñas */}
        <div className="lg:col-span-7 space-y-4">
          {errorResenas && (
            <div className="rounded bg-[#2B1414] border border-[#EF4444] p-3 text-xs text-[#FCA5A5]">
              {errorResenas}
            </div>
          )}

          {cargandoResenas && (
            <p className="text-xs text-[#9CA3AF]">Cargando opiniones...</p>
          )}

          {!cargandoResenas && resenas.length === 0 && !errorResenas && (
            <p className="text-xs text-[#9CA3AF]">
              Todavía no hay opiniones de este calzado. ¡Sé el primero en dejar la tuya!
            </p>
          )}

          {resenas.map((r) => {
            // SimpleJWT guarda user_id como texto ('3') y la API devuelve usuario como número (3).
            const esPropia = usuarioId !== null && String(r.usuario) === String(usuarioId);

            if (editandoId === r.id) {
              return (
                <form
                  key={r.id}
                  onSubmit={handleGuardarEdicion}
                  className="rounded-lg bg-[#181818] border border-[#39FF14] p-4 space-y-3"
                >
                  <select
                    value={editCalificacion}
                    onChange={(e) => setEditCalificacion(e.target.value)}
                    aria-label="Calificación"
                    className="w-full h-9 rounded-md bg-[#121212] border border-[#3F3F3F] px-3 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#39FF14]"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {"★".repeat(n)} ({n}/5)
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows={3}
                    value={editComentario}
                    onChange={(e) => setEditComentario(e.target.value)}
                    aria-label="Comentario"
                    className="w-full rounded-md bg-[#121212] border border-[#3F3F3F] p-3 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#39FF14]"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" className="text-xs py-2 px-4">
                      GUARDAR
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="text-xs py-2 px-4"
                      onClick={() => setEditandoId(null)}
                    >
                      CANCELAR
                    </Button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={r.id}
                className="rounded-lg bg-[#181818] border border-[#343434] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xs font-bold text-[#39FF14]">
                      {"★".repeat(r.calificacion)}
                    </span>
                    <span className="font-heading text-xs font-bold text-[#FFFFFF]">
                      {r.usuario_nombre}
                      {esPropia && <span className="text-[#39FF14]"> (vos)</span>}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9CA3AF]">
                    {formatFecha(r.creado_en, { fallback: "" })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
                  &ldquo;{r.comentario}&rdquo;
                </p>

                {/* Solo el autor ve las acciones sobre su reseña */}
                {esPropia &&
                  (confirmandoBorradoId === r.id ? (
                    <div className="flex items-center gap-3 pt-1 text-[11px]">
                      <span className="text-[#FCA5A5]">¿Eliminar esta reseña?</span>
                      <button
                        type="button"
                        onClick={() => handleEliminar(r.id)}
                        className="font-bold uppercase text-[#EF4444] hover:underline"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmandoBorradoId(null)}
                        className="font-bold uppercase text-[#D1D5DB] hover:underline"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4 pt-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleEmpezarEdicion(r)}
                        className="font-bold uppercase text-[#39FF14] hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoId(null);
                          setConfirmandoBorradoId(r.id);
                        }}
                        className="font-bold uppercase text-[#EF4444] hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>

        {/* Formulario para Publicar Reseña */}
        <div className="lg:col-span-5 rounded-lg bg-[#1E1E1E] border border-[#3A3A3A] p-5 space-y-4">
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#FFFFFF]">
            DEJAR TU OPINIÓN
          </h3>

          {resenaEnviada && (
            <div className="rounded bg-[#1D2B1A] border border-[#39FF14] p-3 text-xs text-[#39FF14]">
              ¡Gracias por tu reseña! Fue publicada correctamente.
            </div>
          )}

          {rol === "EMPLEADO" ? (
            // El personal modera las reseñas desde el dashboard, pero no publica opiniones propias.
            <p className="text-xs text-[#D1D5DB]">
              Las opiniones son de los clientes. Como empleado podés moderarlas desde el dashboard.
            </p>
          ) : !token ? (
            <p className="text-xs text-[#D1D5DB]">
              <Link
                href={`/login?redirect=/productos/${productoId}`}
                className="font-bold text-[#39FF14] hover:underline"
              >
                Iniciá sesión
              </Link>{" "}
              para dejar tu opinión sobre este calzado.
            </p>
          ) : (
            <form onSubmit={handlePublicarResena} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#D1D5DB] mb-1">
                  CALIFICACIÓN:
                </label>
                <select
                  value={nuevaCalificacion}
                  onChange={(e) => setNuevaCalificacion(e.target.value)}
                  className="w-full h-10 rounded-md bg-[#121212] border border-[#3F3F3F] px-3 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#39FF14]"
                >
                  <option value="5">★★★★★ (5/5) Rendimiento Excepcional</option>
                  <option value="4">★★★★☆ (4/5) Muy Buen Calzado</option>
                  <option value="3">★★★☆☆ (3/5) Aceptable</option>
                  <option value="2">★★☆☆☆ (2/5) Regular</option>
                  <option value="1">★☆☆☆☆ (1/5) Deficiente</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#D1D5DB] mb-1">
                  COMENTARIO:
                </label>
                <textarea
                  rows={3}
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Compartí tu experiencia sobre el ajuste, la amortiguación y la respuesta de la suela..."
                  className="w-full rounded-md bg-[#121212] border border-[#3F3F3F] p-3 text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#39FF14]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full text-xs py-2.5"
                disabled={enviandoResena}
              >
                {enviandoResena ? "ENVIANDO..." : "ENVIAR OPINIÓN"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
