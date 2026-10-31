"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "./Badge";
import Button from "./Button";
import { useCart } from "../context/CartContext";

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

  const coloresDisponibles = Array.from(
    new Map(
      variantes.map((v) => [
        v.color_hex || (v.color?.toLowerCase().includes("neón") ? "#39FF14" : "#2E2E2E"),
        {
          nombre: v.color || "Color Estándar",
          hex: v.color_hex || (v.color?.toLowerCase().includes("neón") ? "#39FF14" : "#2E2E2E"),
        },
      ])
    ).values()
  );

  const [colorActivo, setColorActivo] = useState(
    coloresDisponibles[0]?.hex || "#39FF14"
  );

  // Filtrar variantes disponibles según el color activo
  const variantesFiltradasPorColor = variantes.filter((v) => {
    const hex = v.color_hex || (v.color?.toLowerCase().includes("neón") ? "#39FF14" : "#2E2E2E");
    return hex === colorActivo;
  });

  const tallesDisponibles =
    variantesFiltradasPorColor.length > 0
      ? variantesFiltradasPorColor
      : variantes;

  const [talleSeleccionado, setTalleSeleccionado] = useState(
    tallesDisponibles.find((v) => v.stock > 0)?.talle || tallesDisponibles[0]?.talle || "42"
  );

  const [fotoActiva, setFotoActiva] = useState(0);
  const [agregadoReciente, setAgregadoReciente] = useState(false);

  // Reseñas de clientes
  const [resenas, setResenas] = useState([
    {
      id: 1,
      autor: "Manuel G.",
      calificacion: 5,
      fecha: "Hace 2 días",
      comentario:
        "Excelente retorno de energía en pasadas de 1000m. La placa de carbono responde al instante en el despegue.",
    },
    {
      id: 2,
      autor: "Valentino C.",
      calificacion: 5,
      fecha: "Hace 1 semana",
      comentario:
        "El calce en talle 41 AR es perfecto. El drop de 8mm mantiene una postura reactiva sin sobrecargar pantorrillas.",
    },
  ]);

  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [resenaEnviada, setResenaEnviada] = useState(false);

  const varianteSeleccionada =
    tallesDisponibles.find((v) => v.talle === talleSeleccionado) ||
    tallesDisponibles[0];

  const stockActual = varianteSeleccionada?.stock ?? 0;
  const skuActivo =
    varianteSeleccionada?.sku ||
    producto.sku_referencia ||
    `VLX-${producto.id}-${talleSeleccionado}`;
  const precioBase = Number(producto.precio_base || 0);
  const precioFinal = Number(
    varianteSeleccionada?.precio_ajustado || precioBase
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

  const handlePublicarResena = (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    const nueva = {
      id: Date.now(),
      autor: "Atleta VELOX",
      calificacion: Number(nuevaCalificacion),
      fecha: "Recién",
      comentario: nuevoComentario.trim(),
    };

    setResenas([nueva, ...resenas]);
    setNuevoComentario("");
    setResenaEnviada(true);
    setTimeout(() => setResenaEnviada(false), 2500);
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
                fill={colorActivo === "#39FF14" ? "#39FF14" : "#444444"}
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

          {/* 1. Selector de Color */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D1D5DB]">
              1. SELECCIONAR COLOR:
            </label>
            <div className="flex items-center gap-3">
              {coloresDisponibles.map((c) => {
                const activo = colorActivo === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColorActivo(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      activo
                        ? "border-[#FFFFFF] scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                        : "border-[#444444] hover:scale-105"
                    }`}
                    aria-label={`Color ${c.nombre}`}
                    title={c.nombre}
                  />
                );
              })}
            </div>
          </div>

          {/* 2. Selector de Talle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-[#D1D5DB]">
              <span>2. SELECCIONAR TALLE (AR):</span>
              <span className="text-[#39FF14] font-mono">
                {stockActual > 0 ? `${stockActual} disponibles` : "Agotado"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {tallesDisponibles.map((v) => {
                const activo = v.talle === talleSeleccionado;
                const sinStock = v.stock === 0;

                return (
                  <button
                    key={v.sku || v.talle}
                    type="button"
                    onClick={() => setTalleSeleccionado(v.talle)}
                    disabled={sinStock}
                    className={`flex flex-col items-center justify-center rounded-lg py-2.5 px-2 border font-heading transition-all ${
                      activo
                        ? "bg-[#39FF14] text-[#121212] border-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.3)]"
                        : sinStock
                        ? "bg-[#181818] text-[#555555] border-[#2A2A2A] line-through cursor-not-allowed"
                        : "bg-[#121212] text-[#FFFFFF] border-[#3F3F3F] hover:border-[#39FF14]"
                    }`}
                  >
                    <span className="text-sm font-extrabold">{v.talle}</span>
                    <span className="text-[10px] font-mono">
                      {sinStock ? "Agotado" : `${v.stock} u.`}
                    </span>
                  </button>
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
            {resenas.map((r) => (
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
                      {r.autor}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9CA3AF]">
                    {r.fecha}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
                  &ldquo;{r.comentario}&rdquo;
                </p>
              </div>
            ))}
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
              >
                ENVIAR OPINIÓN
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
