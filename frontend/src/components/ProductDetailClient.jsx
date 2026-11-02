"use client";
// Client Component ("use client"): Isla interactiva para la ficha técnica de calzado con conmutación de vistas de galería, selección dinámica de talle AR y color SKU, verificación de stock y agregado al carrito global.

import { useState } from "react";
import Badge from "./Badge";
import Button from "./Button";
import SneakerGraphic from "./SneakerGraphic";
import ProductReviewsSection from "./ProductReviewsSection";
import { useCart } from "../context/CartContext";
import { formatARS } from "../lib/formatters";

export default function ProductDetailClient({ producto }) {
  const { addToCart } = useCart();

  // Variantes SKU del producto
  const variantes =
    Array.isArray(producto.variantes) && producto.variantes.length > 0
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

  const imagenActivaUrl =
    producto.imagenes?.[fotoActiva]?.url ||
    producto.imagen_portada ||
    producto.imagenes?.[0]?.url;

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

            {/* Render Principal de Calzado (Híbrido: Imagen Real de BD o Silueta Vectorial Dinámica) */}
            <SneakerGraphic
              variant="detail"
              imagenUrl={imagenActivaUrl}
              accentColor={hexDe(varianteSeleccionada)}
              viewAngle={fotoActiva}
              label={`Vista ${fotoActiva + 1} de ${producto.nombre}`}
            />

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
                {formatARS(precioFinal)}
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

      {/* Sección de Reseñas de Atletas desacoplada */}
      <ProductReviewsSection productoId={producto.id} />
    </div>
  );
}
