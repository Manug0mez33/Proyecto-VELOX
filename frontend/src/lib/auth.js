// Utilitarios de autenticación para VELOX (R4).
// Gestiona tokens JWT, decodificación segura del payload sin dependencias externas y verificación de sesión en Server Components y Server Actions.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isTokenExpired, parseJwt } from "./jwt";

// Se re-exportan para mantener los imports existentes desde "lib/auth".
export { esAdministrador, esPersonalTienda, isTokenExpired, parseJwt } from "./jwt";

export const AUTH_COOKIE_NAME = "velox_access_token";
export const REFRESH_COOKIE_NAME = "velox_refresh_token";
export const USER_COOKIE_NAME = "velox_username";

/**
 * Obtiene el token de acceso JWT almacenado en las Cookies HTTP-Only del servidor.
 * Exclusivo para Server Components, Server Actions o Route Handlers.
 * 
 * @returns {Promise<string|null>} Token JWT o null si no existe
 */
export async function getServerToken() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);
    return tokenCookie?.value || null;
  } catch {
    return null;
  }
}

/**
 * Obtiene los datos del usuario autenticado en el servidor decodificando la cookie HTTP-Only.
 * 
 * @returns {Promise<{ user_id?: number, username?: string, rol?: string, exp?: number } | null>}
 */
export async function getServerUser() {
  const token = await getServerToken();
  if (!token || isTokenExpired(token)) return null;

  const payload = parseJwt(token);
  const cookieStore = await cookies();
  const usernameCookie = cookieStore.get(USER_COOKIE_NAME);

  return {
    ...payload,
    username: payload?.username || usernameCookie?.value || "Usuario",
  };
}

/**
 * Guard de protección para Server Components (ej. /dashboard/page.jsx).
 * Si no hay token de acceso válido en las Cookies HTTP-Only, redirige a /login.
 * 
 * @param {string} [redirectTo="/login"] - Ruta a la que redirigir si no está autenticado
 * @returns {Promise<{ token: string, user: object }>} Datos de sesión validada
 */
export async function requireAuth(redirectTo = "/login") {
  const token = await getServerToken();

  if (!token || isTokenExpired(token)) {
    redirect(redirectTo);
  }

  const user = await getServerUser();
  return { token, user };
}
