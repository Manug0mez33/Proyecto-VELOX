"use client";
// Client Component ("use client"): Página del carrito de compras que consume reactivamente CartContext (R6), orquesta las filas de productos (CartItemRow) y el modal de checkout transaccional (CheckoutModal).

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { formatARS } from "../../lib/formatters";
import { useAuthToken } from "../../lib/useAuthToken";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import CartItemRow from "../../components/CartItemRow";
import CheckoutModal from "../../components/CheckoutModal";

export default function CarritoPage() {
  const {
    items,
    totalItems,
    subtotal,
    total,
    isHydrated,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const { token: authToken, refreshAuth } = useAuthToken();

  if (!isHydrated) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-[1440px] items-center justify-center px-6 py-20">
        <div className="flex flex-col items-center gap-3">
          <span className="h-6 w-6 rounded-full border-2 border-[#39FF14] border-t-transparent animate-spin" />
          <p className="font-heading text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
            CARGANDO CARRITO...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10 space-y-10">
      {/* Cabecera del Carrito */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <Badge variant="outline">COMPRA PROTEGIDA</Badge>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl font-extrabold uppercase text-[#FFFFFF]">
            CARRITO DE COMPRAS
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Revisá tus calzados seleccionados y confirmá tu pedido.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline">TOTAL PRODUCTOS: {totalItems}</Badge>
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
              No tienes ningún calzado deportivo agregado aún. Explorá nuestro catálogo oficial para encontrar tu próximo par de competición.
            </p>
          </div>

          <div className="pt-2">
            <Button variant="primary" href="/productos">
              IR AL CATÁLOGO →
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
          {/* Listado de Productos */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.sku}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}

            <div className="pt-2 flex justify-between items-center">
              <Button
                variant="secondary"
                href="/productos"
                className="text-xs"
              >
                ← SEGUIR COMPRANDO
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
                <span className="font-mono text-[#FFFFFF]">
                  {formatARS(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Envío express</span>
                <span className="font-bold text-[#39FF14]">GRATIS</span>
              </div>
              <div className="flex justify-between border-t border-[#2A2A2A] pt-3 text-sm">
                <span className="font-bold text-[#FFFFFF]">TOTAL ARS</span>
                <span className="font-heading text-xl font-extrabold text-[#39FF14]">
                  {formatARS(total)}
                </span>
              </div>
            </div>

            {/* Aviso breve de autenticación si no ha iniciado sesión */}
            {!authToken && (
              <div className="rounded-lg bg-[#2A1E12] border border-[#F59E0B]/60 p-3 text-xs text-[#F59E0B] space-y-1">
                <p className="font-bold">⚠️ Inicio de sesión requerido</p>
                <p className="text-[#D1D5DB] text-[11px]">
                  Para finalizar el pedido necesitás acceder con tu cuenta o registrarte.
                </p>
              </div>
            )}

            <Button
              variant="primary"
              onClick={() => {
                refreshAuth();
                setCheckoutError("");
                setIsCheckoutModalOpen(true);
              }}
              className="w-full py-4 text-xs tracking-widest"
            >
              FINALIZAR PEDIDO →
            </Button>

            <div className="rounded-lg bg-[#141414] p-3 text-[11px] text-[#9CA3AF] space-y-1">
              <p className="font-bold text-[#FFFFFF]">Garantía Oficial:</p>
              <p>Cambios y devoluciones oficiales en hasta 30 días sin costo.</p>
            </div>
          </aside>
        </div>
      )}

      {/* Modal de Confirmación para Vaciar Carrito */}
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
        <p className="text-[#D1D5DB]">
          Esta acción removerá todos los pares de calzado seleccionados de tu carrito.
        </p>
      </Modal>

      {/* Modal Interactivo de Checkout */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        items={items}
        totalItems={totalItems}
        total={total}
        authToken={authToken}
        clearCart={clearCart}
        externalError={checkoutError}
        onClearExternalError={() => setCheckoutError("")}
      />
    </div>
  );
}
