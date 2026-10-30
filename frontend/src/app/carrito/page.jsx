"use client";
// Client Component ("use client"): Vista interactiva del carrito de compras que consume useCart() de CartContext (R6) y procesa el checkout transaccional conectado a POST /api/pedidos/ de DRF con React Hook Form + Zod (R5).

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCart } from "../../context/CartContext";
import { checkoutFormSchema, orderSchema } from "../../validations/orderSchema";
import { api, ApiError } from "../../lib/api";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";

function formatPrecioARS(valor) {
  const numero = Number(valor) || 0;
  return `$${numero.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

// Variantes reales sincronizadas con el fixture catalogo_velox.json de Django
const SAMPLE_VARIANTS = [
  {
    id: 54,
    variante_id: 54,
    sku: "VX-VSR-38-BLA",
    nombre: "Velox Street Run",
    marca: "VELOX Performance",
    categoria: "Urbano",
    talle: "38",
    color: "Blanco",
    precio_final: 99999,
  },
  {
    id: 49,
    variante_id: 49,
    sku: "VX-VSR-38-GRI",
    nombre: "Velox Street Run",
    marca: "VELOX Performance",
    categoria: "Urbano",
    talle: "38",
    color: "Gris",
    precio_final: 99999,
  },
  {
    id: 55,
    variante_id: 55,
    sku: "VX-VSR-39-BLA",
    nombre: "Velox Street Run",
    marca: "VELOX Performance",
    categoria: "Urbano",
    talle: "39",
    color: "Blanco",
    precio_final: 99999,
  },
  {
    id: 44,
    variante_id: 44,
    sku: "VX-VCX-39-NEG",
    nombre: "Velox Carbon X",
    marca: "VELOX Performance",
    categoria: "Running",
    talle: "39",
    color: "Negro",
    precio_final: 249999,
  },
];

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
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [orderConfirmedData, setOrderConfirmedData] = useState(null);

  // Estado de autenticación JWT (localStorage)
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

    // 1. Obtener y verificar el token JWT de acceso
    const currentToken =
      authToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("velox_access_token")
        : null);

    if (!currentToken) {
      setCheckoutError(
        "Debes iniciar sesión antes de confirmar la compra. Inicia sesión con tu cuenta de atleta para enviar el pedido a Django REST Framework."
      );
      setIsSubmittingOrder(false);
      return;
    }

    try {
      // 2. Formatear dirección completa de despacho (max 255 chars para Pedido.direccion_envio)
      const direccionCompleta = [
        formData.direccion_envio.trim(),
        formData.ciudad.trim(),
        `CP: ${formData.codigo_postal.trim()}`,
        `Tel: ${formData.telefono_contacto.trim()}`,
        formData.notas_adicionales?.trim()
          ? `[Obs: ${formData.notas_adicionales.trim()}]`
          : null,
      ]
        .filter(Boolean)
        .join(" - ")
        .slice(0, 255);

      // 3. Empaquetar detalles conforme al contrato de PedidoCreateSerializer de DRF
      const detalles = items.map((it) => ({
        variante: Number(it.variante_id || it.id),
        cantidad: Number(it.cantidad),
      }));

      // 4. Validar payload con orderSchema en snake_case
      const fullOrderData = {
        ...formData,
        direccion_envio: formData.direccion_envio,
        detalles,
        items: items.map((it) => ({
          variante_sku: it.sku,
          variante_id: Number(it.variante_id || it.id),
          nombre_producto: it.nombre,
          cantidad: it.cantidad,
          precio_unitario: it.precio,
        })),
      };

      const validation = orderSchema.safeParse(fullOrderData);
      if (!validation.success) {
        const errorMsg = validation.error.issues
          .map((i) => i.message)
          .join(" | ");
        setCheckoutError(`Error de validación: ${errorMsg}`);
        setIsSubmittingOrder(false);
        return;
      }

      // 5. Payload exacto exigido por POST /api/pedidos/ en Django REST Framework
      const drfPayload = {
        metodo_pago: formData.metodo_pago,
        direccion_envio: direccionCompleta,
        detalles,
      };

      // 6. Ejecución transaccional atómica con encabezado Authorization: Bearer <token>
      const response = await api.post("/pedidos/", drfPayload, {
        token: currentToken,
      });

      // 7. Almacenar datos reales devueltos por el backend (201 Created)
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

      // 8. Limpiar carrito global y reiniciar formulario
      clearCart();
      resetCheckoutForm();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setCheckoutError(
            "Tu sesión ha expirado o las credenciales JWT no son válidas. Por favor, inicia sesión nuevamente para completar tu compra."
          );
        } else {
          setCheckoutError(
            err.message ||
              "Error al procesar el pedido con Django REST Framework."
          );
        }
      } else {
        setCheckoutError(err.message || "Error al procesar el pedido.");
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  };

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

  // Helper para cargar variantes reales existentes en la base de datos (catalogo_velox.json)
  const handleAddSampleItem = () => {
    const existingSkus = new Set(items.map((it) => it.sku));
    const nextVariant =
      SAMPLE_VARIANTS.find((v) => !existingSkus.has(v.sku)) ||
      SAMPLE_VARIANTS[0];
    addToCart(nextVariant, 1);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-20 py-10 space-y-10">
      {/* Cabecera del Carrito */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Badge variant="neon">CHECKOUT TRANSACCIONAL R5 + R6</Badge>
            <span className="font-heading text-xs font-bold uppercase tracking-widest text-[#39FF14]">
              POST /api/pedidos/ • DRF
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
              No tienes ningún calzado deportivo agregado aún. Agrega variantes
              reales de nuestro catálogo o calzados de prueba vinculados al
              inventario físico de la base de datos.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button variant="primary" href="/productos">
              ACELERAR AL CATÁLOGO →
            </Button>
            <Button variant="secondary" onClick={handleAddSampleItem}>
              + AGREGAR CALZADO DE PRUEBA (SKU REAL)
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
                      {item.marca} • TALLE {item.talle} AR • COLOR {item.color}
                    </p>
                    <h3 className="font-heading text-lg font-bold text-[#FFFFFF]">
                      {item.nombre}
                    </h3>
                    <p className="font-mono text-xs text-[#39FF14]">
                      SKU: {item.sku} (ID #{item.variante_id || item.id})
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
              <Button
                variant="secondary"
                onClick={handleAddSampleItem}
                className="text-xs"
              >
                + AGREGAR OTRA VARIANTE AL CARRITO (SKU REAL)
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

            {/* Aviso breve de autenticación si no ha iniciado sesión */}
            {!authToken && (
              <div className="rounded-lg bg-[#2A1E12] border border-[#F59E0B]/60 p-3 text-xs text-[#F59E0B] space-y-1">
                <p className="font-bold">⚠️ Usuario no autenticado</p>
                <p className="text-[#D1D5DB] text-[11px]">
                  Para finalizar el pedido se requerirá inicio de sesión con token JWT.
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
          Esta acción removerá todos los pares de calzado seleccionados de tu
          carrito y sincronizará el estado en{" "}
          <code className="text-[#39FF14]">localStorage</code>.
        </p>
      </Modal>

      {/* Modal Interactivo de Checkout con React Hook Form + Zod (R5) */}
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
            ? "ORDEN CONFIRMADA EN DRF • VELOX SPEED"
            : "FINALIZAR PEDIDO (CHECKOUT R5)"
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
              <p className="font-mono text-sm text-[#FFFFFF]">
                NÚMERO DE ORDEN:{" "}
                <strong className="text-[#39FF14]">
                  {orderConfirmedData.numero_pedido}
                </strong>{" "}
                (ID #{orderConfirmedData.id})
              </p>
              <p className="text-xs text-[#D1D5DB]">
                Se generó la transacción atómica con descuento de inventario en{" "}
                <code className="text-[#39FF14]">POST /api/pedidos/</code> y se
                limpió el carrito.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#181818] border border-[#2A2A2A] p-4 text-xs">
              <div>
                <p className="text-[#9CA3AF] uppercase text-[10px] font-bold">
                  Dirección de Despacho (DRF):
                </p>
                <p className="text-[#FFFFFF] font-medium">
                  {orderConfirmedData.direccion_envio}
                </p>
                <p className="text-[#9CA3AF] mt-1">
                  Fecha de Transacción: {orderConfirmedData.fecha}
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
                  <span className="text-[#F59E0B] font-bold">
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
                          <span className="font-mono text-[#39FF14] text-[11px]">
                            {item.sku}
                          </span>
                        </span>
                        <span className="font-mono text-white flex-shrink-0">
                          {formatPrecioARS(item.precio * item.cantidad)}
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
                  <span>AUTENTICACIÓN REQUERIDA (JWT)</span>
                </div>
                <p className="text-[#D1D5DB] leading-relaxed">
                  Para confirmar tu compra y registrar el pedido en Django REST
                  Framework (<code className="text-[#39FF14]">POST /api/pedidos/</code>),
                  debes iniciar sesión con tu cuenta de atleta.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#39FF14] px-4 py-2 font-heading text-xs font-bold uppercase tracking-wider text-[#121212] hover:bg-[#32e012] transition-colors"
                  >
                    INICIAR SESIÓN AHORA →
                  </Link>
                  <span className="text-[11px] text-[#9CA3AF]">
                    O usa credenciales de prueba:{" "}
                    <code className="text-white">cliente1</code> /{" "}
                    <code className="text-white">cliente1234</code>
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs text-[#9CA3AF]">
                Completa tus datos de entrega y selección de método de pago
                validados bajo el esquema Zod{" "}
                <code className="text-[#39FF14]">checkoutFormSchema</code> en
                paridad <code className="text-[#39FF14]">snake_case</code> con
                DRF.
              </p>
            </div>

            {checkoutError && (
              <div
                data-testid="checkout-error-box"
                className="rounded-lg bg-[#2A1515] border border-[#EF4444] p-3 text-xs text-[#F87171] leading-relaxed space-y-2"
              >
                <p>{checkoutError}</p>
                {checkoutError.includes("inicia sesión") && (
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
                Dirección de Envío (direccion_envio) *
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
                  Ciudad (ciudad) *
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
                  Código Postal (codigo_postal) *
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
                  Teléfono de Contacto (telefono_contacto) *
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
                  Método de Pago (metodo_pago - DRF) *
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
                    TARJETA DE CRÉDITO (Visa / Master)
                  </option>
                  <option value="TARJETA_DEBITO">
                    TARJETA DE DÉBITO
                  </option>
                  <option value="TRANSFERENCIA">
                    TRANSFERENCIA BANCARIA (Alias/CBU)
                  </option>
                  <option value="EFECTIVO">
                    EFECTIVO CONTRA ENTREGA
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
                Notas para Entrega (notas_adicionales - Opcional)
              </label>
              <textarea
                id="notas_adicionales"
                rows={2}
                placeholder="ej. Timbre departamento 2, entregar por la tarde."
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
                  ? "PROCESANDO CON DRF..."
                  : `CONFIRMAR COMPRA (${formatPrecioARS(total)}) →`}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
