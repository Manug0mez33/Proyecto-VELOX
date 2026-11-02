"use client";
// Client Component ("use client"): Modal interactivo de Checkout que gestiona el formulario de envío y pago con React Hook Form + Zod (R5), envía la orden transaccional a DRF y presenta el comprobante confirmado.

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutFormSchema } from "../validations/orderSchema";
import { api, ApiError } from "../lib/api";
import { formatARS, formatFecha, getPrecioUnitario } from "../lib/formatters";
import Button from "./Button";
import Modal from "./Modal";

export default function CheckoutModal({
  isOpen,
  onClose,
  items,
  totalItems,
  total,
  authToken,
  clearCart,
  externalError = "",
  onClearExternalError,
}) {
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [internalError, setInternalError] = useState("");
  const [orderConfirmedData, setOrderConfirmedData] = useState(null);

  const checkoutError = internalError || externalError;

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

  const handleCloseModal = () => {
    if (isSubmittingOrder) return;
    setInternalError("");
    if (onClearExternalError) onClearExternalError();
    if (orderConfirmedData) setOrderConfirmedData(null);
    onClose();
  };

  const onCheckoutSubmit = async (formData) => {
    setIsSubmittingOrder(true);
    setInternalError("");
    if (onClearExternalError) onClearExternalError();

    const currentToken =
      authToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("velox_access_token")
        : null);

    if (!currentToken) {
      setInternalError(
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

      const fechaStr = formatFecha(response.fecha_creacion, {
        fallback: new Date().toLocaleDateString("es-AR"),
      });

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
          setInternalError(
            "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente para completar tu compra."
          );
        } else {
          setInternalError(
            err.message || "Error al procesar el pedido. Por favor intentá nuevamente."
          );
        }
      } else {
        setInternalError(err.message || "Error al procesar el pedido.");
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      size="lg"
      title={
        orderConfirmedData
          ? "ORDEN CONFIRMADA • VELOX SPEED"
          : "FINALIZAR PEDIDO"
      }
      footer={
        orderConfirmedData ? (
          <>
            {/* Lleva al seguimiento del pedido recién creado */}
            <Button
              variant="secondary"
              href="/mis-pedidos"
              className="px-6 py-2.5 text-xs tracking-wider"
            >
              VER MIS PEDIDOS
            </Button>
            <Button
              variant="primary"
              onClick={handleCloseModal}
              className="px-6 py-2.5 text-xs tracking-wider"
            >
              FINALIZAR Y CONTINUAR →
            </Button>
          </>
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
                        {formatARS(getPrecioUnitario(item) * item.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="border-t border-[#2A2A2A] pt-3 flex justify-between items-center text-sm">
            <span className="font-bold text-[#FFFFFF]">TOTAL FACTURADO:</span>
            <span className="font-heading text-xl font-extrabold text-[#39FF14]">
              {formatARS(orderConfirmedData.total_abonado)}
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
              {formatARS(total)}
            </span>
          </div>

          {/* Acciones del Formulario */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2A2A]">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmittingOrder}
              onClick={handleCloseModal}
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
                : `CONFIRMAR COMPRA (${formatARS(total)}) →`}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
