// Utilitarios de autenticación para VELOX (R4).
// Gestiona tokens JWT, decodificación segura del payload sin dependencias externas y verificación de sesión en Server Components y Server Actions.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const AUTH_COOKIE_NAME = "velox_access_token";
export const REFRESH_COOKIE_NAME = "velox_refresh_token";
export const USER_COOKIE_NAME = "velox_username";

/**
 * Decodifica de forma segura el payload de un token JWT en Base64Url sin requerir librerías externas.
 * Soporta caracteres UTF-8 en nombres y campos especiales.
 * 
 * @param {string} token - Token JWT codificado (header.payload.signature)
 * @returns {object|null} Payload decodificado o null si el token es inválido
 */
export function parseJwt(token) {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64Url a Base64 estándar
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Decodificación segura UTF-8 en Node.js o navegador
    let jsonPayload;
    if (typeof atob === "function") {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      jsonPayload = new TextDecoder("utf-8").decode(bytes);
    } else if (typeof Buffer !== "undefined") {
      jsonPayload = Buffer.from(base64, "base64").toString("utf-8");
    } else {
      return null;
    }

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Verifica si un token JWT está expirado comparando su claim 'exp' con la fecha actual.
 * 
 * @param {string} token - Token JWT
 * @returns {boolean} true si está expirado o es inválido, false si está vigente
 */
export function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;

  // 'exp' en JWT se expresa en segundos UNIX; Date.now() en milisegundos
  const expiresAt = payload.exp * 1000;
  return Date.now() >= expiresAt;
}

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
