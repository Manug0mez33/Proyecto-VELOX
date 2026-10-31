// Decodificación de JWT sin dependencias de servidor: la usan el proxy, Server Components
// y Client Components (Navbar, reseñas) a partir del token guardado en cookie o localStorage.

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
 * Indica si el token pertenece a personal de la tienda (ADMIN, EMPLEADO o superusuario).
 * El backend agrega el claim "es_personal_tienda" al emitir el token (TokenVeloxSerializer).
 *
 * @param {string} token - Token JWT
 * @returns {boolean} true si el usuario puede acceder al dashboard
 */
export function esPersonalTienda(token) {
  return Boolean(parseJwt(token)?.es_personal_tienda);
}

/**
 * Indica si el token pertenece a un administrador (rol ADMIN o superusuario).
 * Solo ellos acceden a la gestión de usuarios y roles del dashboard.
 *
 * @param {string} token - Token JWT
 * @returns {boolean} true si el usuario es administrador
 */
export function esAdministrador(token) {
  return Boolean(parseJwt(token)?.es_administrador);
}
