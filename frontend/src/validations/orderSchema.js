import { z } from "zod";

/**
 * Métodos de pago permitidos en VELOX, alineados con Pedido.MetodoPago de Django REST Framework.
 */
export const METODOS_PAGO = [
  "TARJETA_CREDITO",
  "TARJETA_DEBITO",
  "TRANSFERENCIA",
  "EFECTIVO",
];

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
  metodo_pago: z.enum(
    METODOS_PAGO,
    {
      errorMap: () => ({
        message:
          "Selecciona un método de pago válido (TARJETA_CREDITO, TARJETA_DEBITO, TRANSFERENCIA o EFECTIVO).",
      }),
    }
  ),
  notas_adicionales: z
    .string()
    .max(500, "Las notas adicionales no pueden exceder 500 caracteres.")
    .optional()
    .or(z.literal("")),
});
