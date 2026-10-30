import { z } from "zod";

/**
 * Esquema de validación para el inicio de sesión (/login).
 * Cumple con el contrato snake_case esperado por Django REST Framework y SimpleJWT.
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "El nombre de usuario es obligatorio.")
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
    .max(150, "El nombre de usuario no puede exceder los 150 caracteres.")
    .trim(),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria.")
    .min(8, "La contraseña debe contener al menos 8 caracteres."),
});

/**
 * Esquema de validación para el registro de clientes (/registro o POST /api/usuarios/).
 * Sincronizado exactamente con las claves snake_case de RegistroUsuarioSerializer en Django REST Framework.
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "El nombre de usuario es obligatorio.")
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
      .max(150, "El nombre de usuario no puede superar 150 caracteres.")
      .regex(
        /^[a-zA-Z0-9_.-]+$/,
        "El nombre de usuario solo puede contener letras, números, guiones y puntos."
      )
      .trim(),
    email: z
      .string()
      .min(1, "El correo electrónico es obligatorio.")
      .email("Ingresa un correo electrónico válido.")
      .max(254, "El correo no puede exceder 254 caracteres.")
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(1, "La contraseña es obligatoria.")
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirm_password: z
      .string()
      .min(1, "Debes confirmar tu contraseña."),
    first_name: z
      .string()
      .max(150, "El nombre no puede exceder 150 caracteres.")
      .optional()
      .or(z.literal("")),
    last_name: z
      .string()
      .max(150, "El apellido no puede exceder 150 caracteres.")
      .optional()
      .or(z.literal("")),
    telefono: z
      .string()
      .max(30, "El teléfono no puede exceder 30 dígitos.")
      .optional()
      .or(z.literal("")),
    direccion: z
      .string()
      .max(200, "La dirección no puede exceder 200 caracteres.")
      .optional()
      .or(z.literal("")),
    ciudad: z
      .string()
      .max(100, "La ciudad no puede exceder 100 caracteres.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden.",
    path: ["confirm_password"],
  });
