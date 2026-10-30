import { z } from "zod";

/**
 * Esquema de validación para un ítem individual dentro de un pedido o carrito.
 * Reseta claves en snake_case para envío directo a PedidoViewSet de DRF.
 */
export const orderItemSchema = z.object({
  variante_sku: z
    .string()
    .min(1, "El SKU de la variante es obligatorio."),
  variante_id: z
    .union([z.number(), z.string()])
    .optional(),
  nombre_producto: z
    .string()
    .optional(),
  cantidad: z
    .number({ invalid_type_error: "La cantidad debe ser un número." })
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad mínima por producto es 1."),
  precio_unitario: z
    .number({ invalid_type_error: "El precio unitario debe ser numérico." })
    .positive("El precio unitario debe ser mayor a 0."),
});

/**
 * Esquema de validación para los datos de contacto y entrega del formulario de checkout.
 * Utilizado por React Hook Form para validar los inputs del cliente antes del envío.
 */
export const checkoutFormSchema = z.object({
  direccion_envio: z
    .string()
    .min(1, "La dirección de envío es obligatoria.")
    .min(5, "La dirección debe contener al menos 5 caracteres.")
    .max(250, "La dirección no puede exceder 250 caracteres.")
    .trim(),
  ciudad: z
    .string()
    .min(1, "La ciudad es obligatoria.")
    .min(2, "La ciudad debe tener al menos 2 caracteres.")
    .max(100, "La ciudad no puede exceder 100 caracteres.")
    .trim(),
  codigo_postal: z
    .string()
    .min(1, "El código postal es obligatorio.")
    .min(3, "El código postal debe tener al menos 3 caracteres.")
    .max(10, "El código postal no puede exceder 10 caracteres.")
    .trim(),
  telefono_contacto: z
    .string()
    .min(1, "El teléfono de contacto es obligatorio.")
    .min(6, "El teléfono debe contener al menos 6 caracteres.")
    .max(30, "El teléfono no puede exceder 30 dígitos.")
    .trim(),
  metodo_pago: z.enum(["TARJETA", "TRANSFERENCIA", "EFECTIVO"], {
    errorMap: () => ({ message: "Selecciona un método de pago válido (TARJETA, TRANSFERENCIA o EFECTIVO)." }),
  }),
  notas_adicionales: z
    .string()
    .max(500, "Las notas adicionales no pueden exceder 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

/**
 * Esquema de validación completo para el payload transaccional de pedidos (POST /api/pedidos/).
 * Asegura paridad snake_case estricta con los modelos y serializadores de Django REST Framework.
 */
export const checkoutSchema = checkoutFormSchema.extend({
  items: z
    .array(orderItemSchema)
    .min(1, "El pedido debe contener al menos un producto en el carrito."),
});

// Alias semántico para interoperabilidad
export const orderSchema = checkoutSchema;
