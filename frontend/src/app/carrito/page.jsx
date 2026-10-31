"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "../../context/CartContext";
import { checkoutFormSchema } from "../../validations/orderSchema";
import { api, ApiError } from "../../lib/api";
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
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderConfirmedData, setOrderConfirmedData] = useState(null);

  // Estado de autenticación
  const [authToken, setAuthToken] = useState(null);
  const [authUsername, setAuthUsername] = useState(null);

  useEffect(() => {
    const syncAuth = () => {
      try {
        const token = localStorage.getItem("velox_access_token");
        const user = localStorage.getItem("velox_username");
        setAuthToken(token || null);
        setAuthUsername(user || null);
      } catch {
        setAuthToken(null);
        setAuthUsername(null);
      }
    };

    syncAuth();
    window.addEventListener("velox-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("velox-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset: resetCheckoutForm,
    formState: { errors: checkoutErrors },
  } = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      direccion_envio: "",
      ciudad: "",
      codigo_postal: "",
      telefono_contacto: "",
      metodo_pago: "TARJETA_CREDITO",
      notas_adicionales: "",
    },
  });

  const onCheckoutSubmit = async (formData) => {
    setIsSubmittingOrder(true);
    setCheckoutError("");

    const currentToken =
      authToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("velox_access_token")
        : null);

    if (!currentToken) {
      setCheckoutError(
        "Debes iniciar sesión antes de confirmar la compra. Por favor ingresá a tu cuenta de usuario."
      );
      setIsSubmittingOrder(false);
      return;
    }

    try {
      const direccionCompleta = [
        formData.direccion_envio,
        formData.ciudad,
        formData.codigo_postal ? `CP ${formData.codigo_postal}` : null,
      ]
        .filter(Boolean)
        .join(", ");

      const drfPayload = {
        direccion_envio: direccionCompleta,
        metodo_pago: formData.metodo_pago,
        // "detalles" es el campo que espera PedidoCreateSerializer. El precio no se envía:
        // lo calcula el backend desde la variante para que no se pueda manipular.
        detalles: items.map((item) => ({
          variante: item.variante_id || item.id,
          cantidad: item.cantidad,
        })),
      };

      const response = await api.post("/pedidos/", drfPayload, {
        token: currentToken,
      });

      const fechaCreacionRaw = response.fecha_creacion;
      const parsedDate = fechaCreacionRaw ? new Date(fechaCreacionRaw) : null;
      const fechaStr =
        parsedDate && !isNaN(parsedDate.getTime())
          ? parsedDate.toLocaleDateString("es-AR")
          : new Date().toLocaleDateString("es-AR");

      setOrderConfirmedData({
        id: response.id,
        numero_pedido: `VLX-PED-${response.id}`,
        total_abonado: Number(response.total ?? total),
        estado: response.estado || "PENDIENTE",
        metodo_pago: response.metodo_pago || formData.metodo_pago,
        direccion_envio: response.direccion_envio || direccionCompleta,
        fecha: fechaStr,
        items_comprados: [...items],
      });

      clearCart();
      resetCheckoutForm();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setCheckoutError(
            "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente para completar tu compra."
          );
        } else {
          setCheckoutError(
            err.message || "Error al procesar el pedido. Por favor intentá nuevamente."
          );
        }
      } else {
        setCheckoutError(err.message || "Error al procesar el pedido.");
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

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
              <article
                key={item.sku}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 transition-colors hover:border-[#39FF14]/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[#141414] border border-[#2A2A2A]">
                    <span className="text-2xl">👟</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      {item.marca} • TALLE {item.talle} AR • COLOR {item.color}
                    </p>
                    <h3 className="font-heading text-lg font-bold text-[#FFFFFF]">
                      {item.nombre}
                    </h3>
                    <p className="font-heading text-xs text-[#39FF14]">
                      REF: {item.sku}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-[#2A2A2A] pt-3 sm:pt-0">
                  {/* Selector de Cantidad */}
                  <div className="flex items-center rounded-lg border border-[#383838] bg-[#121212]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.sku, item.cantidad - 1)}
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
                      onClick={() => updateQuantity(item.sku, item.cantidad + 1)}
                      className="flex h-9 w-9 items-center justify-center text-sm font-bold text-[#FFFFFF] hover:bg-[#2A2A2A] transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal del Ítem */}
                  <div className="text-right min-w-[90px]">
                    <span className="font-heading text-base font-extrabold text-[#FFFFFF]">
                      {formatPrecioARS(
                        (item.precio_final || item.precio_base) * item.cantidad
                      )}
                    </span>
                  </div>

                  {/* Botón Eliminar */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.sku)}
                    className="text-xs text-[#9CA3AF] hover:text-[#EF4444] transition-colors p-2"
                    aria-label={`Eliminar ${item.nombre} del carrito`}
                  >
                    ✕
                  </button>
                </div>
              </article>
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
                  {formatPrecioARS(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Envío express</span>
                <span className="font-bold text-[#39FF14]">GRATIS</span>
              </div>
              <div className="flex justify-between border-t border-[#2A2A2A] pt-3 text-sm">
                <span className="font-bold text-[#FFFFFF]">TOTAL ARS</span>
                <span className="font-heading text-xl font-extrabold text-[#39FF14]">
                  {formatPrecioARS(total)}
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
                try {
                  const token = localStorage.getItem("velox_access_token");
                  const user = localStorage.getItem("velox_username");
                  setAuthToken(token || null);
                  setAuthUsername(user || null);
                } catch {
                  // Entorno sin localStorage disponible
                }
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
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          if (!isSubmittingOrder) {
            setIsCheckoutModalOpen(false);
            if (orderConfirmedData) setOrderConfirmedData(null);
          }
        }}
        size="lg"
        title={
          orderConfirmedData
            ? "ORDEN CONFIRMADA • VELOX SPEED"
            : "FINALIZAR PEDIDO"
        }
        footer={
          orderConfirmedData ? (
            <Button
              variant="primary"
              onClick={() => {
                setOrderConfirmedData(null);
                setIsCheckoutModalOpen(false);
              }}
              className="px-6 py-2.5 text-xs tracking-wider"
            >
              FINALIZAR Y CONTINUAR →
            </Button>
          ) : null
        }
      >
        {orderConfirmedData ? (
          <div className="space-y-5">
            <div className="rounded-xl bg-[#142612] border border-[#39FF14] p-5 text-center space-y-2">
              <span className="inline-block text-3xl">🏁</span>
              <h4 className="font-heading text-lg font-bold uppercase text-[#39FF14]">
                ¡ORDEN REGISTRADA EXITOSAMENTE!
              </h4>
              <p className="font-heading text-sm text-[#FFFFFF]">
                NÚMERO DE ORDEN:{" "}
                <strong className="text-[#39FF14]">
                  {orderConfirmedData.numero_pedido}
                </strong>
              </p>
              <p className="text-xs text-[#D1D5DB]">
                Tu pedido fue registrado con éxito. Prepararemos tu paquete a la brevedad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#181818] border border-[#2A2A2A] p-4 text-xs">
              <div>
                <p className="text-[#9CA3AF] uppercase text-[10px] font-bold">
                  Dirección de Despacho:
                </p>
                <p className="text-[#FFFFFF] font-medium">
                  {orderConfirmedData.direccion_envio}
                </p>
                <p className="text-[#9CA3AF] mt-1">
                  Fecha: {orderConfirmedData.fecha}
                </p>
              </div>
              <div>
                <p className="text-[#9CA3AF] uppercase text-[10px] font-bold">
                  Detalles de Pago y Estado:
                </p>
                <p className="text-[#39FF14] font-bold">
                  Método: {orderConfirmedData.metodo_pago}
                </p>
                <p className="text-[#FFFFFF] font-medium mt-1">
                  Estado:{" "}
                  <span className="text-[#39FF14] font-bold">
                    {orderConfirmedData.estado}
                  </span>
                </p>
              </div>
            </div>

            {orderConfirmedData.items_comprados &&
              orderConfirmedData.items_comprados.length > 0 && (
                <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 space-y-2">
                  <p className="text-[#9CA3AF] uppercase text-[10px] font-bold tracking-wider">
                    Artículos Confirmados:
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {orderConfirmedData.items_comprados.map((item) => (
                      <div
                        key={item.sku}
                        className="flex items-center justify-between text-xs text-[#D1D5DB]"
                      >
                        <span className="truncate pr-2">
                          {item.nombre} (x{item.cantidad}) •{" "}
                          <span className="font-heading text-[#39FF14] text-[11px]">
                            {item.sku}
                          </span>
                        </span>
                        <span className="font-heading text-white flex-shrink-0">
                          {formatPrecioARS(item.precio_final * item.cantidad)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="border-t border-[#2A2A2A] pt-3 flex justify-between items-center text-sm">
              <span className="font-bold text-[#FFFFFF]">TOTAL FACTURADO:</span>
              <span className="font-heading text-xl font-extrabold text-[#39FF14]">
                {formatPrecioARS(orderConfirmedData.total_abonado)}
              </span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onCheckoutSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Aviso destacado si el usuario no ha iniciado sesión */}
            {!authToken && (
              <div
                data-testid="auth-required-banner"
                className="rounded-xl bg-[#2A1E12] border border-[#F59E0B] p-4 text-xs space-y-3"
              >
                <div className="flex items-center gap-2 text-[#F59E0B] font-bold uppercase tracking-wider">
                  <span className="text-base">⚠️</span>
                  <span>INICIO DE SESIÓN REQUERIDO</span>
                </div>
                <p className="text-[#D1D5DB] leading-relaxed">
                  Para confirmar tu compra, por favor iniciá sesión con tu cuenta o registrate si todavía no tenés una.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#39FF14] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#32e012] transition-colors"
                  >
                    INICIAR SESIÓN →
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#2A2A2A] border border-[#3F3F3F] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-[#FFFFFF] hover:border-[#39FF14] transition-colors"
                  >
                    CREAR CUENTA
                  </Link>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs text-[#9CA3AF]">
                Completá tus datos de entrega y seleccioná el medio de pago preferido.
              </p>
            </div>

            {checkoutError && (
              <div
                data-testid="checkout-error-box"
                className="rounded-lg bg-[#2A1515] border border-[#EF4444] p-3 text-xs text-[#F87171] leading-relaxed space-y-2"
              >
                <p>{checkoutError}</p>
                {checkoutError.includes("iniciar sesión") && (
                  <div>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1 font-heading text-xs font-bold uppercase tracking-wider text-[#39FF14] hover:underline"
                    >
                      ACCEDER AL LOGIN AHORA →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Dirección de Envío */}
            <div>
              <label
                htmlFor="direccion_envio"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1"
              >
                Dirección de Envío *
              </label>
              <input
                id="direccion_envio"
                type="text"
                placeholder="ej. Boulevard Roca 1234, Dpto 2B"
                {...register("direccion_envio")}
                className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:ring-1 ${
                  checkoutErrors.direccion_envio
                    ? "border-[#EF4444] focus:ring-[#EF4444]"
                    : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                }`}
              />
              {checkoutErrors.direccion_envio && (
                <p className="mt-1 text-xs text-[#EF4444]">
                  {checkoutErrors.direccion_envio.message}
                </p>
              )}
            </div>

            {/* Ciudad y Código Postal en 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ciudad"
                  className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1"
                >
                  Ciudad *
                </label>
                <input
                  id="ciudad"
                  type="text"
                  placeholder="ej. Río Cuarto"
                  {...register("ciudad")}
                  className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:ring-1 ${
                    checkoutErrors.ciudad
                      ? "border-[#EF4444] focus:ring-[#EF4444]"
                      : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                  }`}
                />
                {checkoutErrors.ciudad && (
                  <p className="mt-1 text-xs text-[#EF4444]">
                    {checkoutErrors.ciudad.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="codigo_postal"
                  className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1"
                >
                  Código Postal *
                </label>
                <input
                  id="codigo_postal"
                  type="text"
                  placeholder="ej. 5800"
                  {...register("codigo_postal")}
                  className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:ring-1 ${
                    checkoutErrors.codigo_postal
                      ? "border-[#EF4444] focus:ring-[#EF4444]"
                      : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                  }`}
                />
                {checkoutErrors.codigo_postal && (
                  <p className="mt-1 text-xs text-[#EF4444]">
                    {checkoutErrors.codigo_postal.message}
                  </p>
                )}
              </div>
            </div>

            {/* Teléfono de Contacto y Método de Pago en 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="telefono_contacto"
                  className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1"
                >
                  Teléfono de Contacto *
                </label>
                <input
                  id="telefono_contacto"
                  type="tel"
                  placeholder="ej. 3584123456"
                  {...register("telefono_contacto")}
                  className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:outline-none focus:ring-1 ${
                    checkoutErrors.telefono_contacto
                      ? "border-[#EF4444] focus:ring-[#EF4444]"
                      : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                  }`}
                />
                {checkoutErrors.telefono_contacto && (
                  <p className="mt-1 text-xs text-[#EF4444]">
                    {checkoutErrors.telefono_contacto.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="metodo_pago"
                  className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1"
                >
                  Método de Pago *
                </label>
                <select
                  id="metodo_pago"
                  {...register("metodo_pago")}
                  className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] focus:outline-none focus:ring-1 ${
                    checkoutErrors.metodo_pago
                      ? "border-[#EF4444] focus:ring-[#EF4444]"
                      : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                  }`}
                >
                  <option value="TARJETA_CREDITO">
                    Tarjeta de Crédito (Visa / Mastercard)
                  </option>
                  <option value="TARJETA_DEBITO">
                    Tarjeta de Débito
                  </option>
                  <option value="TRANSFERENCIA">
                    Transferencia Bancaria (Alias / CBU)
                  </option>
                  <option value="EFECTIVO">
                    Efectivo contra entrega
                  </option>
                </select>
                {checkoutErrors.metodo_pago && (
                  <p className="mt-1 text-xs text-[#EF4444]">
                    {checkoutErrors.metodo_pago.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notas Adicionales */}
            <div>
              <label
                htmlFor="notas_adicionales"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1"
              >
                Notas para la Entrega (Opcional)
              </label>
              <textarea
                id="notas_adicionales"
                rows={2}
                placeholder="ej. Timbre departamento 2, entregar preferentemente por la tarde."
                {...register("notas_adicionales")}
                className="w-full rounded-lg bg-[#121212] border border-[#2A2A2A] px-3.5 py-2 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
              />
            </div>

            {/* Resumen del Pedido */}
            <div className="rounded-lg bg-[#141414] border border-[#2A2A2A] p-3 text-xs flex justify-between items-center">
              <span className="text-[#9CA3AF]">
                Total ({totalItems} {totalItems === 1 ? "ítem" : "ítems"}):
              </span>
              <span className="font-heading font-bold text-sm text-[#39FF14]">
                {formatPrecioARS(total)}
              </span>
            </div>

            {/* Acciones del Formulario */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2A2A]">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmittingOrder}
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-4 py-2 text-xs"
              >
                CANCELAR
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmittingOrder || items.length === 0}
                className="px-5 py-2.5 text-xs font-bold"
              >
                {isSubmittingOrder
                  ? "PROCESANDO COMPRA..."
                  : `CONFIRMAR COMPRA (${formatPrecioARS(total)}) →`}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
