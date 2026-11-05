/**
 * Decodificación y verificación de roles para JSON Web Tokens (JWT) en VELOX (R4).
 * Funciona de forma segura tanto en el servidor (Node.js) como en el navegador.
 */

export function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8")
    );
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function esPersonalTienda(token) {
  const payload = parseJwt(token);
  return Boolean(
    payload?.es_personal_tienda ||
    payload?.rol === "ADMIN" ||
    payload?.rol === "EMPLEADO"
  );
}

export function esAdministrador(token) {
  const payload = parseJwt(token);
  return Boolean(payload?.es_administrador || payload?.rol === "ADMIN");
}
