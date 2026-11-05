/**
 * Utilitarios de autenticación para VELOX (R4).
 * Maneja cookies HTTP-Only en el servidor y protección de páginas privadas.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isTokenExpired, parseJwt } from "./jwt";

export { esAdministrador, esPersonalTienda, isTokenExpired, parseJwt } from "./jwt";

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

// Alias utilitario para obtener token
export const getToken = getServerToken;

/**
 * Obtiene el usuario decodificado desde el token en el servidor.
 */
export async function getServerUser() {
  const token = await getServerToken();
  if (!token || isTokenExpired(token)) return null;
  return parseJwt(token);
}

/**
 * Guard para proteger páginas en el servidor (R4). Redirige a /login si no hay sesión.
 */
export async function requireAuth(redirectTo = "/login") {
  const token = await getServerToken();
  if (!token || isTokenExpired(token)) {
    redirect(redirectTo);
  }
  return { token, user: parseJwt(token) };
}

// Alias utilitario para requerir token
export const requireToken = async () => (await requireAuth()).token;
