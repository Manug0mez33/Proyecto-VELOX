/**
 * Utilitarios de autenticación para VELOX (R4).
 * Nombres de las cookies de sesión y lectura del token en el servidor.
 */

import { cookies } from "next/headers";

export { esAdministrador } from "./jwt";

export const AUTH_COOKIE_NAME = "velox_access_token";
export const REFRESH_COOKIE_NAME = "velox_refresh_token";
export const USER_COOKIE_NAME = "velox_username";

/**
 * Obtiene el token JWT desde las Cookies en Server Components o Server Actions.
 */
export async function getServerToken() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}
