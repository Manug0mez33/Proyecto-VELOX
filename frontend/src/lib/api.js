/**
 * Cliente HTTP unificado para el consumo de la API REST de VELOX (Django REST Framework).
 * Soporta las 4 operaciones CRUD (R3), autenticación JWT y normalización paginada.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Normaliza respuestas de listado para asegurar siempre { count, next, previous, results }.
 */
export function normalizePaginatedResponse(data) {
  if (!data) return { count: 0, next: null, previous: null, results: [] };
  if (Array.isArray(data.results)) {
    return {
      count: Number(data.count) || data.results.length,
      next: data.next || null,
      previous: data.previous || null,
      results: data.results,
    };
  }
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }
  return { count: 0, next: null, previous: null, results: [] };
}

/**
 * Formatea errores devueltos por Django REST Framework (diccionarios de validación o 'detail').
 */
export function formatDrfError(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.map(formatDrfError).filter(Boolean).join(" ");
  if (typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(" ");
    return Object.entries(data)
      .map(([key, val]) => {
        const formatted = formatDrfError(val);
        return isNaN(Number(key)) ? `${key}: ${formatted}` : formatted;
      })
      .filter(Boolean)
      .join(" | ");
  }
  return String(data);
}

/**
 * Función base para peticiones HTTP con fetch.
 */
export async function fetchApi(endpoint, options = {}) {
  const { params, headers = {}, token, ...customConfig } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  // Adjuntar parámetros de consulta si existen
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
    const qs = query.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;
  }

  // Token desde parámetro o localStorage si estamos en el navegador
  const clientToken = token || (typeof window !== "undefined" ? localStorage.getItem("velox_access_token") : null);

  const reqHeaders = {
    Accept: "application/json",
    ...(clientToken ? { Authorization: `Bearer ${clientToken}` } : {}),
    ...headers,
  };

  if (customConfig.body && !(customConfig.body instanceof FormData) && !reqHeaders["Content-Type"]) {
    reqHeaders["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: reqHeaders,
    });

    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const message = formatDrfError(data) || `Error HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(message, response.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      "No se pudo conectar con el servidor de VELOX.",
      0,
      null
    );
  }
}

/**
 * Métodos auxiliares para las 4 operaciones del CRUD (R3)
 */
export const api = {
  get: (endpoint, options = {}) =>
    fetchApi(endpoint, { method: "GET", ...options }),

  getPaginated: async (endpoint, options = {}) =>
    normalizePaginatedResponse(await api.get(endpoint, options)),

  post: (endpoint, body, options = {}) =>
    fetchApi(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  patch: (endpoint, body, options = {}) =>
    fetchApi(endpoint, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, options = {}) =>
    fetchApi(endpoint, { method: "DELETE", ...options }),
};

export default api;
