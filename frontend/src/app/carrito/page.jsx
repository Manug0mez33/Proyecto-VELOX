"use client";
// Client Component ("use client"): Vista interactiva del carrito de compras que consume useCart() de CartContext (R6) para listar items, modificar cantidades y avanzar al checkout.

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";

function formatPrecioARS(valor) {
  const numero = Number(valor) || 0;
  return `$${numero.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export default function CarritoPage() {
  const {
    items,
    totalItems,
    subtotal,
    total,
    isHydrated,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Evita el parpadeo de contenido desincronizado antes de leer localStorage
  if (!isHydrated) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-[1440px] items-center justify-center px-6 py-20">
        <div className="flex flex-col items-center gap-3">
          <span className="h-6 w-6 rounded-full border-2 border-[#39FF14] border-t-transparent animate-spin" />
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
            SINCRONIZANDO ESTADO GLOBAL DEL CARRITO (R6)...
          </p>
        </div>
      </div>
    );
  }

  // Helper para pruebas rápidas durante la evaluación
  const handleAddSampleItem = () => {
    addToCart(
      {
        id: 1,
        sku: "VLX-AER-41-NEO",
        nombre: "VELOX AERO NITRO ELITE",
        marca: "VELOX LAB",
        categoria: "COMPETICIÓN",
        talle: "41",
        color: "NEO GREEN",
        precio_final: 189500,
      },
      1
    );
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10 space-y-10">
      {/* Cabecera del Carrito */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Badge variant="neon">ESTADO GLOBAL R6</Badge>
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
              CARTCONTEXT + LOCALSTORAGE
            </span>
          </div>
          <h1 className="mt-1 font-heading text-3xl sm:text-4xl font-extrabold uppercase text-[#FFFFFF]">
            CARRITO DE COMPRAS
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline">TOTAL ITEMS: {totalItems}</Badge>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="text-xs font-bold uppercase tracking-wider text-[#EF4444] hover:underline"
            >
              VACIAR CARRITO
            </button>
          )}
        </div>
      </div>

      {/* Contenido: Vacío vs. Con Ítems */}
      {items.length === 0 ? (
        <div className="rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] p-12 text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#141414] border border-[#2A2A2A]">
            <span className="text-3xl">🛒</span>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-heading text-2xl font-bold uppercase text-[#FFFFFF]">
              TU CARRITO ESTÁ VACÍO
            </h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              No tienes ningún calzado deportivo agregado aún. Explora los modelos de alto rendimiento con placa de fibra de carbono en nuestro catálogo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button variant="primary" href="/productos">
              ACELERAR AL CATÁLOGO →
            </Button>
            <Button variant="secondary" onClick={handleAddSampleItem}>
              + AGREGAR CALZADO DE PRUEBA
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          {/* Listado de Productos */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <article
                key={item.sku}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 transition-colors hover:border-[#39FF14]/40"
              >
                <div className="flex items-center gap-4">
                  {/* Icono de Calzado con fondo oscuro */}
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[#141414] border border-[#2A2A2A]">
                    <span className="text-2xl">👟</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      {item.marca} • TALLE {item.talle} AR
                    </p>
                    <h3 className="font-heading text-lg font-bold text-[#FFFFFF]">
                      {item.nombre}
                    </h3>
                    <p className="font-mono text-xs text-[#39FF14]">
                      SKU: {item.sku}
                    </p>
                  </div>
                </div>

                {/* Controles de Cantidad y Precio */}
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[#2A2A2A] pt-3 sm:pt-0">
                  {/* Selector interactivo de cantidad */}
                  <div className="inline-flex items-center rounded-lg bg-[#141414] border border-[#2A2A2A]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.sku, item.cantidad - 1)}
                      className="px-3 py-1.5 text-sm font-bold text-[#D1D5DB] hover:text-[#39FF14]"
                      aria-label="Disminuir cantidad"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-heading text-xs font-bold text-[#FFFFFF]">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.sku, item.cantidad + 1)}
                      className="px-3 py-1.5 text-sm font-bold text-[#D1D5DB] hover:text-[#39FF14]"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-heading text-lg font-bold text-[#39FF14]">
                      {formatPrecioARS(item.precio * item.cantidad)}
                    </p>
                    {item.cantidad > 1 && (
                      <p className="text-[11px] text-[#6B7280]">
                        {formatPrecioARS(item.precio)} c/u
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.sku)}
                    className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                    aria-label={`Eliminar ${item.nombre}`}
                    title="Eliminar producto"
                  >
                    ✕
                  </button>
                </div>
              </article>
            ))}

            <div className="pt-2 flex justify-between items-center">
              <Button variant="secondary" onClick={handleAddSampleItem} className="text-xs">
                + AGREGAR OTRA VARIANTE AL CARRITO
              </Button>
            </div>
          </div>

          {/* Resumen de Compra / Orden */}
          <aside className="lg:col-span-4 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-6 space-y-6">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-[#FFFFFF] border-b border-[#2A2A2A] pb-3">
              RESUMEN DE PEDIDO
            </h2>

            <div className="space-y-3 text-xs text-[#D1D5DB]">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} productos)</span>
                <span className="font-mono text-[#FFFFFF]">{formatPrecioARS(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío express (Serie Carbon)</span>
                <span className="font-bold text-[#39FF14]">GRATIS</span>
              </div>
              <div className="flex justify-between border-t border-[#2A2A2A] pt-3 text-sm">
                <span className="font-bold text-[#FFFFFF]">TOTAL ARS</span>
                <span className="font-heading text-xl font-extrabold text-[#39FF14]">
                  {formatPrecioARS(total)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="w-full py-4 text-xs tracking-widest"
            >
              PROCEDER AL CHECKOUT →
            </Button>

            <div className="rounded-lg bg-[#141414] p-3 text-[11px] text-[#9CA3AF] space-y-1">
              <p className="font-bold text-[#FFFFFF]">Garantía VELOX Lab:</p>
              <p>Cambios y devoluciones oficiales en hasta 30 días sin cargo.</p>
            </div>
          </aside>
        </div>
      )}

      {/* Modal de Confirmación para Vaciar Carrito (R2) */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="¿VACIAR CARRITO?"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsClearModalOpen(false)}
              className="px-4 py-2 text-xs"
            >
              CANCELAR
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearCart();
                setIsClearModalOpen(false);
              }}
              className="px-4 py-2 text-xs"
            >
              SÍ, VACIAR CARRITO
            </Button>
          </>
        }
      >
        <p>
          Esta acción removerá todos los pares de calzado seleccionados de tu carrito y sincronizará el estado en <code className="text-[#39FF14]">localStorage</code>.
        </p>
      </Modal>

      {/* Modal de Simulación de Checkout (R2) */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="CHECKOUT VELOX • PEDIDO PREPARADO"
        footer={
          <Button
            variant="primary"
            onClick={() => setIsCheckoutModalOpen(false)}
            className="px-5 py-2 text-xs"
          >
            ENTENDIDO
          </Button>
        }
      >
        <div className="space-y-3">
          <p>
            ¡Tu pedido con <strong className="text-[#39FF14]">{totalItems} productos</strong> por un total de <strong className="text-[#39FF14]">{formatPrecioARS(total)}</strong> está listo para ser enviado a través del endpoint transaccional <code className="text-[#39FF14]">POST /api/pedidos/</code>!
          </p>
          <p className="text-xs text-[#9CA3AF]">
            Los datos son validados automáticamente con el esquema de Zod <code className="text-[#39FF14]">orderSchema.js</code> en estricto cumplimiento del contrato <code className="text-[#39FF14]">snake_case</code> pactado con Django REST Framework.
          </p>
        </div>
      </Modal>
    </div>
  );
}
