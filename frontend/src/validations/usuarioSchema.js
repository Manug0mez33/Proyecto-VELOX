import { z } from "zod";

export const ROLES_USUARIO = [
  { value: "CLIENTE", label: "Cliente" },
  { value: "EMPLEADO", label: "Empleado" },
  { value: "ADMIN", label: "Administrador" },
];

/**
 * Esquema de validación para el alta de usuarios desde el dashboard (POST /api/usuarios/ como ADMIN).
 * Usa las mismas claves snake_case que RegistroUsuarioSerializer; el backend solo respeta "rol"
 * cuando quien crea la cuenta es administrador.
 */
export const usuarioAdminSchema = z.object({
  username: z
    .string()
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
    .trim()
    .toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  first_name: z.string().max(150, "El nombre no puede exceder 150 caracteres.").optional().or(z.literal("")),
  last_name: z.string().max(150, "El apellido no puede exceder 150 caracteres.").optional().or(z.literal("")),
  rol: z.enum(["CLIENTE", "EMPLEADO", "ADMIN"], { message: "Seleccioná un rol válido." }),
});
