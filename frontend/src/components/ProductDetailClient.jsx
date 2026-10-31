"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Badge from "./Badge";
import Button from "./Button";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { parseJwt } from "../lib/jwt";

function formatearFecha(iso) {
  const fecha = iso ? new Date(iso) : null;
  return fecha && !isNaN(fecha.getTime()) ? fecha.toLocaleDateString("es-AR") : "";
}

export default function ProductDetailClient({ producto }) {
  const { addToCart } = useCart();

  // Variantes SKU del producto
  const variantes = Array.isArray(producto.variantes) && producto.variantes.length > 0
    ? producto.variantes
    : [
        { id: 101, sku: `${producto.sku_referencia || "VLX-PRO"}-40`, talle: "40", stock: 3, color: "Titanio", color_hex: "#2E2E2E" },
        { id: 102, sku: `${producto.sku_referencia || "VLX-PRO"}-41`, talle: "41", stock: 6, color: "Titanio", color_hex: "#2E2E2E" },
        { id: 103, sku: `${producto.sku_referencia || "VLX-PRO"}-42-NEO`, talle: "42", stock: 8, color: "Neón", color_hex: "#39FF14" },
        { id: 104, sku: `${producto.sku_referencia || "VLX-PRO"}-43-NEO`, talle: "43", stock: 2, color: "Neón", color_hex: "#39FF14" },
        { id: 105, sku: `${producto.sku_referencia || "VLX-PRO"}-44-BLK`, talle: "44", stock: 0, color: "Carbón", color_hex: "#121212" },
      ];

  // La API manda el color como "codigo_hex"; los datos de ejemplo usan "color_hex".
  const hexDe = (v) => v?.codigo_hex || v?.color_hex || "#2E2E2E";

  // Un botón por talle, con el stock sumado de todos sus colores.
  const tallesDisponibles = [];
  variantes.forEach((v) => {
    const existente = tallesDisponibles.find((t) => t.talle === v.talle);
    if (existente) existente.stock += Number(v.stock) || 0;
    else tallesDisponibles.push({ talle: v.talle, stock: Number(v.stock) || 0 });
  });

  const [talleSeleccionado, setTalleSeleccionado] = useState(
    tallesDisponibles.find((t) => t.stock > 0)?.talle || tallesDisponibles[0]?.talle
  );
  const [varianteElegidaId, setVarianteElegidaId] = useState(null);

  // Colores disponibles para el talle elegido (cada uno es una variante con su SKU).
  const coloresDelTalle = variantes.filter((v) => v.talle === talleSeleccionado);

  const [fotoActiva, setFotoActiva] = useState(0);
  const [agregadoReciente, setAgregadoReciente] = useState(false);

  // Reseñas reales del producto (GET/POST/PATCH/DELETE /api/resenas/)
  const [resenas, setResenas] = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(true);
  const [errorResenas, setErrorResenas] = useState("");
  const [token, setToken] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [resenaEnviada, setResenaEnviada] = useState(false);
  const [enviandoResena, setEnviandoResena] = useState(false);

  // Edición y borrado de las reseñas propias
  const [editandoId, setEditandoId] = useState(null);
  const [editCalificacion, setEditCalificacion] = useState(5);
  const [editComentario, setEditComentario] = useState("");
  const [confirmandoBorradoId, setConfirmandoBorradoId] = useState(null);

  // El user_id del token permite saber qué reseñas son del usuario logueado.
  useEffect(() => {
    const syncSesion = () => {
      try {
        const stored = localStorage.getItem("velox_access_token");
        setToken(stored || null);
        setUsuarioId(parseJwt(stored)?.user_id ?? null);
      } catch {
        setToken(null);
        setUsuarioId(null);
      }
    };
    syncSesion();
    window.addEventListener("velox-auth-changed", syncSesion);
    window.addEventListener("storage", syncSesion);
    return () => {
      window.removeEventListener("velox-auth-changed", syncSesion);
      window.removeEventListener("storage", syncSesion);
    };
  }, []);

  const cargarResenas = useCallback(async () => {
    setCargandoResenas(true);
    try {
      const data = await api.getPaginated("/resenas/", {
        params: { producto: producto.id, ordering: "-creado_en", page_size: 100 },
      });
      setResenas(data.results);
      setErrorResenas("");
    } catch (err) {
      setErrorResenas(err.message || "No se pudieron cargar las reseñas.");
    } finally {
      setCargandoResenas(false);
    }
  }, [producto.id]);

  useEffect(() => {
    cargarResenas();
  }, [cargarResenas]);

  // Si todavía no se eligió color, se toma el primero con stock de ese talle.
  const varianteSeleccionada =
    coloresDelTalle.find((v) => v.id === varianteElegidaId) ||
    coloresDelTalle.find((v) => v.stock > 0) ||
    coloresDelTalle[0];

  // Al cambiar de talle se conserva el color elegido, si ese talle lo tiene.
  const handleElegirTalle = (talle) => {
    const mismoColor = variantes.find(
      (v) => v.talle === talle && v.color === varianteSeleccionada?.color && v.stock > 0
    );
    setTalleSeleccionado(talle);
    setVarianteElegidaId(mismoColor?.id ?? null);
  };

  const stockActual = varianteSeleccionada?.stock ?? 0;
  const skuActivo =
    varianteSeleccionada?.sku ||
    producto.sku_referencia ||
    `VLX-${producto.id}-${talleSeleccionado}`;
  const precioBase = Number(producto.precio_base || 0);
  // precio_final ya resuelve en el backend si la variante tiene precio ajustado.
  const precioFinal = Number(
    varianteSeleccionada?.precio_final || varianteSeleccionada?.precio_ajustado || precioBase
  );

  const handleAgregarAlCarrito = () => {
    if (stockActual === 0) return;

    addToCart(
      {
        id: producto.id,
        variante_id: varianteSeleccionada?.id || producto.id,
        sku: skuActivo,
        nombre: producto.nombre,
        marca: producto.marca_detalle?.nombre || producto.marca || "VELOX LAB",
        categoria:
          producto.categoria_detalle?.nombre ||
          producto.categoria ||
          "COMPETICIÓN",
        talle: talleSeleccionado,
        color: varianteSeleccionada?.color || "Neón",
        precio_base: precioFinal,
        precio_final: precioFinal,
        imagen_portada: producto.imagen_portada || producto.imagenes?.[0]?.url,
      },
      1
    );

    setAgregadoReciente(true);
    setTimeout(() => setAgregadoReciente(false), 2000);
  };

  const handlePublicarResena = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !token) return;

    setEnviandoResena(true);
    setErrorResenas("");
    try {
      const creada = await api.post(
        "/resenas/",
        {
          producto: producto.id,
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
    <div className="space-y-16">
      {/* Sección Superior: Galería y Ficha de Compra */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Columna Izquierda: Galería de Fotos */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative flex h-[380px] sm:h-[460px] w-full items-center justify-center rounded-xl bg-[#181818] border border-[#2A2A2A] p-6 overflow-hidden">
            {/* Glow Neón de Fondo */}
            <div
              className="pointer-events-none absolute h-64 w-96 rounded-full bg-[#39FF14]/15 blur-3xl"
              aria-hidden="true"
            />

            {/* Badges superiores */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <Badge variant="neon">
                {producto.categoria_detalle?.nombre || "COMPETICIÓN"}
              </Badge>
              <Badge variant="outline">
                {producto.genero || "UNISEX PRO"}
              </Badge>
            </div>

            <div className="absolute top-4 right-4 z-10 font-heading text-xs font-bold text-[#39FF14]">
              ● SERIE OFICIAL
            </div>

            {/* Render Principal de Calzado */}
            <svg
              viewBox="0 0 480 260"
              className="relative z-10 w-full max-w-[420px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)]"
              aria-label={`Vista ${fotoActiva + 1} de ${producto.nombre}`}
            >
              <ellipse cx="240" cy="235" rx="200" ry="12" fill="#090909" />
              <path
                d="M30 190 Q150 205 300 195 Q405 188 455 162 Q468 178 452 198 Q390 222 250 222 Q105 222 25 208 Z"
                fill={hexDe(varianteSeleccionada) === "#39FF14" ? "#39FF14" : "#444444"}
              />
              <path
                d="M45 188 L85 95 Q125 80 165 108 L255 65 Q285 58 305 85 L395 132 Q445 142 452 162 Q355 194 195 195 Q95 195 45 188 Z"
                fill="#242424"
                stroke="#555555"
                strokeWidth="2"
              />
              <path
                d="M135 145 L295 115 L275 135 L120 162 Z"
                fill="#39FF14"
              />
              <path
                d="M185 168 L345 142 L332 156 L175 178 Z"
                fill="#39FF14"
                fillOpacity="0.7"
              />
              <path
                d="M92 95 Q125 62 162 68 L185 102 Z"
                fill="#1C1C1C"
                stroke="#39FF14"
                strokeWidth="1.5"
              />
            </svg>

            <span className="absolute bottom-4 left-4 font-heading text-[11px] text-[#9CA3AF]">
              Vista: {fotoActiva === 0 ? "Perspectiva Frontal" : fotoActiva === 1 ? "Perfil Lateral" : "Suela de Carbono"}
            </span>
          </div>

          {/* Miniaturas de la Galería */}
          <div className="grid grid-cols-3 gap-3">
            {["Vista Frontal", "Perfil Lateral", "Suela de Carbono"].map(
              (label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFotoActiva(idx)}
                  className={`flex items-center justify-center rounded-lg p-3 text-xs font-heading font-bold transition-all border ${
                    fotoActiva === idx
                      ? "bg-[#2A2A2A] text-[#39FF14] border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                      : "bg-[#181818] text-[#9CA3AF] border-[#343434] hover:text-[#FFFFFF]"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* Columna Derecha: Panel de Configuración y Compra */}
        <div className="lg:col-span-5 rounded-xl bg-[#2A2A2A] border border-[#383838] p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5 border-b border-[#383838] pb-5">
            <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14]">
              ● DISPONIBILIDAD CONFIRMADA
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FFFFFF]">
              {producto.nombre}
            </h1>
            <p className="text-xs uppercase text-[#9CA3AF]">
              Marca: {producto.marca_detalle?.nombre || "VELOX Performance"} •
              Categoría: {producto.categoria_detalle?.nombre || "Running"}
            </p>
            <div className="pt-2">
              <span className="font-heading text-3xl font-extrabold text-[#39FF14]">
                ${precioFinal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* 1. Selector de Talle: un botón por talle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-[#D1D5DB]">
              <span>1. SELECCIONAR TALLE (AR):</span>
              <span className="text-[#39FF14] font-mono">
                {stockActual > 0 ? `${stockActual} disponibles` : "Agotado"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {tallesDisponibles.map((t) => {
                const activo = t.talle === talleSeleccionado;
                const sinStock = t.stock === 0;

                return (
                  <button
                    key={t.talle}
                    type="button"
                    onClick={() => handleElegirTalle(t.talle)}
                    disabled={sinStock}
                    className={`flex flex-col items-center justify-center rounded-lg py-2.5 px-2 border font-heading transition-all ${
                      activo
                        ? "bg-[#39FF14] text-[#121212] border-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.3)]"
                        : sinStock
                        ? "bg-[#181818] text-[#555555] border-[#2A2A2A] line-through cursor-not-allowed"
                        : "bg-[#121212] text-[#FFFFFF] border-[#3F3F3F] hover:border-[#39FF14]"
                    }`}
                  >
                    <span className="text-sm font-extrabold">{t.talle}</span>
                    <span className="text-[10px] font-mono">
                      {sinStock ? "Agotado" : `${t.stock} u.`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Selector de Color: los colores del talle elegido */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D1D5DB]">
              2. SELECCIONAR COLOR:{" "}
              <span className="text-[#FFFFFF]">{varianteSeleccionada?.color}</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {coloresDelTalle.map((v) => {
                const activo = v.id === varianteSeleccionada?.id;
                const sinStock = v.stock === 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVarianteElegidaId(v.id)}
                    disabled={sinStock}
                    style={{ backgroundColor: hexDe(v) }}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      activo
                        ? "border-[#39FF14] scale-110 shadow-[0_0_12px_rgba(57,255,20,0.5)]"
                        : sinStock
                        ? "border-[#444444] opacity-30 cursor-not-allowed"
                        : "border-[#666666] hover:scale-105"
                    }`}
                    aria-label={`Color ${v.color}${sinStock ? " (agotado)" : ""}`}
                    title={`${v.color} — ${sinStock ? "agotado" : `${v.stock} u.`}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Caja Informativa de Referencia */}
          <div className="rounded-lg bg-[#181818] border border-[#383838] p-3.5 space-y-1 text-xs">
            <p className="font-heading text-[#39FF14]">
              REFERENCIA: <span className="text-[#FFFFFF]">{skuActivo}</span>
            </p>
            <p className="text-[#9CA3AF]">
              Disponibilidad: {stockActual > 0 ? "En almacén central para despacho inmediato" : "Sin unidades en este talle actualmente"}
            </p>
          </div>

          {/* Botón de Compra */}
          <div className="space-y-3 pt-2">
            <Button
              variant={agregadoReciente ? "outline" : "primary"}
              onClick={handleAgregarAlCarrito}
              disabled={stockActual === 0}
              className="w-full h-12 text-sm"
            >
              {agregadoReciente
                ? "¡CALZADO AÑADIDO AL CARRITO! ✓"
                : stockActual === 0
                ? "VARIANTE AGOTADA"
                : "AÑADIR AL CARRITO"}
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" href="/carrito" className="flex-1 py-2 text-xs">
                IR AL CARRITO
              </Button>
              <Button variant="secondary" href="/productos" className="flex-1 py-2 text-xs">
                CATÁLOGO
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECCIÓN DE RESEÑAS ==================== */}
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
                      {formatearFecha(r.creado_en)}
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

            {parseJwt(token)?.rol === "EMPLEADO" ? (
              // El personal modera las reseñas desde el dashboard, pero no publica opiniones propias.
              <p className="text-xs text-[#D1D5DB]">
                Las opiniones son de los clientes. Como empleado podés moderarlas desde el dashboard.
              </p>
            ) : !token ? (
              <p className="text-xs text-[#D1D5DB]">
                <Link href={`/login?redirect=/productos/${producto.id}`} className="font-bold text-[#39FF14] hover:underline">
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
    </div>
  );
}
