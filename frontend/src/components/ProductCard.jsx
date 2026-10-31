"use client";
// Client Component ("use client"): Permite al atleta seleccionar interactivamente el talle en la tarjeta, previsualizar la variante SKU y agregarlo directamente al carrito global mediante CartContext (R6) o navegar a la ficha técnica detallada.

import Link from "next/link";
import { useState } from "react";
import Badge from "./Badge";
import Button from "./Button";
import { useCart } from "../context/CartContext";

export default function ProductCard({ producto }) {
  const { addToCart } = useCart();

  // Normalización de datos con soporte DRF (snake_case) y fallbacks
  const id = producto.id;
  const nombre = producto.nombre || "Calzado VELOX";
  const marcaNombre =
    producto.marca_detalle?.nombre ||
    producto.marca?.nombre ||
    producto.marca ||
    "VELOX LAB";
  const categoriaNombre =
    producto.categoria_detalle?.nombre ||
    producto.categoria?.nombre ||
    producto.categoria ||
    "COMPETICIÓN";
  const genero = producto.genero || "UNISEX";
  const precioBase = Number(producto.precio_base || producto.precio || 0);

  // Variantes y talles deduplicados por número de talle
  const variantes = Array.isArray(producto.variantes) ? producto.variantes : [];
  const tallesMap = new Map();

  if (variantes.length > 0) {
    variantes.forEach((v) => {
      const numTalle = String(v.talle_detalle?.numero || v.talle?.numero || v.talle || "").trim();
      if (!numTalle) return;
      if (!tallesMap.has(numTalle)) {
        tallesMap.set(numTalle, {
          id: v.id,
          sku: v.sku,
          talle: numTalle,
          stock: Number(v.stock_actual ?? v.stock ?? 0),
          color: v.color_detalle?.nombre || v.color?.nombre || v.color || "Neón",
          precioAjustado: Number(v.precio_final ?? v.precio_ajustado) || null,
          variantePrincipal: v,
        });
      } else {
        const item = tallesMap.get(numTalle);
        const stockVariante = Number(v.stock_actual ?? v.stock ?? 0);
        const stockPrincipal = Number(item.variantePrincipal?.stock_actual ?? item.variantePrincipal?.stock ?? 0);
        item.stock += stockVariante;
        // La compra rápida usa el color con más stock de ese talle (nunca uno agotado si hay otro).
        if (stockVariante > stockPrincipal) {
          item.id = v.id;
          item.sku = v.sku;
          item.color = v.color_detalle?.nombre || v.color?.nombre || v.color || item.color;
          item.precioAjustado = Number(v.precio_final ?? v.precio_ajustado) || null;
          item.variantePrincipal = v;
        }
      }
    });
  }

  const tallesDisponibles =
    tallesMap.size > 0
      // parseFloat: los talles llegan como "40 AR" y Number() daría NaN.
      ? Array.from(tallesMap.values()).sort((a, b) => parseFloat(a.talle) - parseFloat(b.talle))
      : (producto.talles || ["39", "40", "41", "42"]).map((t, idx) => ({
          id: idx + 1,
          sku: `${producto.sku_referencia || "VLX-PRO"}-${t}`,
          talle: String(t),
          stock: producto.stock_total ?? 10,
          color: "Negro/Neón",
          precioAjustado: null,
          variantePrincipal: null,
        }));

  const [talleSeleccionado, setTalleSeleccionado] = useState(
    tallesDisponibles[0]?.talle || "41"
  );
  const [agregadoReciente, setAgregadoReciente] = useState(false);

  const varianteActiva =
    tallesDisponibles.find((t) => t.talle === talleSeleccionado) ||
    tallesDisponibles[0];

  const stockActual = varianteActiva?.stock ?? 0;
  const skuActivo = varianteActiva?.sku || producto.sku_referencia || `VLX-${id}`;
  const precioFinal = varianteActiva?.precioAjustado || precioBase;
  const esDestacado = Boolean(producto.es_destacado);

  const handleAgregarAlCarrito = (e) => {
    e.preventDefault();
    addToCart(
      {
        id,
        variante_id: varianteActiva?.id || id,
        sku: skuActivo,
        nombre,
        marca: marcaNombre,
        categoria: categoriaNombre,
        talle: talleSeleccionado,
        color: varianteActiva?.color || "Neón",
        precio_base: precioFinal,
        precio_final: precioFinal,
        imagen_portada: producto.imagen_portada || producto.imagenes?.[0]?.url,
      },
      1
    );

    setAgregadoReciente(true);
    setTimeout(() => setAgregadoReciente(false), 1800);
  };

  return (
    <article
      className={`group flex flex-col justify-between rounded-lg bg-[#2A2A2A] p-5 transition-all duration-200 hover:-translate-y-1 ${
        esDestacado
          ? "border-[1.5px] border-[#39FF14] shadow-[0_0_24px_rgba(57,255,20,0.15)]"
          : "border border-[#383838] hover:border-[#39FF14]/60"
      }`}
    >
      <div>
        {/* Imagen técnica con Glow y Badges (Manual de Marca VELOX) */}
        <Link href={`/productos/${id}`} className="block">
          <div className="relative mb-5 flex h-[220px] w-full items-center justify-center rounded-md bg-[#181818] p-4 overflow-hidden border border-[#242424]">
            <div
              className="pointer-events-none absolute h-24 w-48 rounded-full bg-[#39FF14]/15 blur-2xl transition-all duration-300 group-hover:bg-[#39FF14]/25"
              aria-hidden="true"
            />

            {/* Badges superiores */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant={esDestacado ? "neon" : "default"}>
                {esDestacado ? "★ DESTACADO" : categoriaNombre}
              </Badge>
            </div>

            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant={
                  stockActual === 0
                    ? "danger"
                    : stockActual <= 3
                    ? "danger"
                    : "outline"
                }
              >
                {stockActual === 0
                  ? "AGOTADO"
                  : stockActual <= 3
                  ? `ÚLTIMAS ${stockActual}`
                  : `STOCK: ${stockActual}`}
              </Badge>
            </div>

            {/* Silueta vectorial de calzado VELOX */}
            <svg
              viewBox="0 0 340 160"
              className="relative z-10 w-64 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <ellipse cx="170" cy="148" rx="140" ry="8" fill="#0A0A0A" />
              <path
                d="M45 125 L80 65 L150 72 L215 45 L285 88 L300 120 L45 125 Z"
                fill="#242424"
                stroke={esDestacado ? "#FFFFFF" : "#39FF14"}
                strokeWidth="2"
              />
              <path
                d="M100 95 L190 75 L175 90 L85 110 Z"
                fill="#39FF14"
                fillOpacity="0.8"
              />
              <rect
                x="40"
                y="122"
                width="265"
                height="13"
                rx="6"
                fill="#39FF14"
              />
            </svg>
          </div>
        </Link>

        {/* Metadatos del producto */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            {marcaNombre} • {genero}
          </p>
          <Link href={`/productos/${id}`}>
            <h3 className="font-heading text-xl font-bold text-[#FFFFFF] hover:text-[#39FF14] transition-colors line-clamp-1">
              {nombre}
            </h3>
          </Link>
          <p className="text-xs text-[#D1D5DB] line-clamp-2 min-h-[32px]">
            {producto.descripcion ||
              "Calzado deportivo biomecánico con placa de fibra de carbono y retorno energético superior."}
          </p>
          <p className="text-[11px] font-mono text-[#39FF14] pt-1">
            SKU: {skuActivo}
          </p>
        </div>

        {/* Selector rápido de talles AR */}
        <div className="mt-4 pt-3 border-t border-[#343434]">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#D1D5DB] mb-2">
            <span>TALLES DISPONIBLES (AR):</span>
            <span className="text-[#9CA3AF] font-normal lowercase">
              stock: {stockActual} u.
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tallesDisponibles.map((t) => {
              const activo = t.talle === talleSeleccionado;
              const sinStock = t.stock === 0;

              return (
                <button
                  key={t.sku || t.talle}
                  type="button"
                  onClick={() => setTalleSeleccionado(t.talle)}
                  disabled={sinStock}
                  className={`inline-flex h-7 min-w-[34px] items-center justify-center rounded px-1.5 font-heading text-xs font-bold transition-all ${
                    activo
                      ? "bg-[#39FF14] text-[#121212] shadow-[0_0_10px_rgba(57,255,20,0.4)]"
                      : sinStock
                      ? "bg-[#181818] text-[#555555] line-through cursor-not-allowed border border-[#2A2A2A]"
                      : "bg-[#121212] text-[#D1D5DB] hover:border-[#39FF14] border border-[#383838]"
                  }`}
                  aria-label={`Seleccionar talle ${t.talle}`}
                >
                  {t.talle}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Precio y Acciones */}
      <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#383838] gap-3">
        <div>
          <span className="block text-[10px] font-mono uppercase text-[#9CA3AF]">
            PRECIO ARS
          </span>
          <span
            className={`font-heading text-xl sm:text-2xl font-extrabold ${
              esDestacado ? "text-[#39FF14]" : "text-[#FFFFFF]"
            }`}
          >
            ${precioFinal.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={agregadoReciente ? "outline" : "primary"}
            onClick={handleAgregarAlCarrito}
            disabled={stockActual === 0}
            className="px-3.5 py-2 text-xs"
          >
            {agregadoReciente ? "¡AGREGADO! ✓" : "COMPRAR"}
          </Button>

          <Button
            variant="secondary"
            href={`/productos/${id}`}
            className="px-3 py-2 text-xs"
            aria-label={`Ver detalles de ${nombre}`}
          >
            VER
          </Button>
        </div>
      </div>
    </article>
  );
}
