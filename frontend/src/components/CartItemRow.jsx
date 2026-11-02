"use client";
// Client Component ("use client"): Representa una fila individual del carrito de compras con miniatura híbrida SneakerGraphic, ajuste interactivo de cantidad (+/-) y eliminación del artículo.

import SneakerGraphic from "./SneakerGraphic";
import { formatARS, getPrecioUnitario } from "../lib/formatters";

export default function CartItemRow({ item, onUpdateQuantity, onRemove }) {
  const unitPrice = getPrecioUnitario(item);
  const talleLimpio = String(item.talle || "").replace(/\s*AR$/i, "");

  return (
    <article className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 transition-colors hover:border-[#39FF14]/40">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[#141414] border border-[#2A2A2A] overflow-hidden p-1.5">
          <SneakerGraphic
            variant="thumb"
            imagenUrl={item.imagen_portada}
            label={item.nombre}
          />
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
            {/* La API ya envía el talle como "41 AR"; se evita repetir el sistema */}
            {item.marca} • TALLE {talleLimpio} AR • COLOR {item.color}
          </p>
          <h3 className="font-heading text-lg font-bold text-[#FFFFFF]">
            {item.nombre}
          </h3>
          <p className="font-heading text-xs text-[#39FF14]">
            REF: {item.sku}
          </p>
          <p className="text-xs text-[#D1D5DB]">
            Precio unitario:{" "}
            <span className="font-heading font-bold text-[#FFFFFF]">
              {formatARS(unitPrice)}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-[#2A2A2A] pt-3 sm:pt-0">
        {/* Selector de Cantidad */}
        <div className="flex items-center rounded-lg border border-[#383838] bg-[#121212]">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.sku, item.cantidad - 1)}
            className="flex h-9 w-9 items-center justify-center text-sm font-bold text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
            aria-label="Disminuir cantidad"
          >
            -
          </button>
          <span className="flex h-9 w-10 items-center justify-center font-mono text-xs font-bold text-[#39FF14]">
            {item.cantidad}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.sku, item.cantidad + 1)}
            className="flex h-9 w-9 items-center justify-center text-sm font-bold text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>

        {/* Subtotal del Ítem (precio unitario x cantidad) */}
        <div className="text-right min-w-[90px]">
          <span className="block font-heading text-base font-extrabold text-[#FFFFFF]">
            {formatARS(unitPrice * item.cantidad)}
          </span>
          <span className="block text-[11px] text-[#9CA3AF]">
            {item.cantidad} × {formatARS(unitPrice)}
          </span>
        </div>

        {/* Botón Eliminar */}
        <button
          type="button"
          onClick={() => onRemove(item.sku)}
          className="text-xs text-[#9CA3AF] hover:text-[#EF4444] transition-colors p-2"
          aria-label={`Eliminar ${item.nombre} del carrito`}
        >
          ✕
        </button>
      </div>
    </article>
  );
}
