/**
 * Cliente HTTP unificado para el consumo de la API REST de VELOX (Django REST Framework).
 * Cumple con el sobre paginado estándar de DRF: { count, next, previous, results } y
 * captura estructurada de errores 400 (diccionario de validación) y 401/403 (detail).
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Normaliza cualquier respuesta de listado de DRF para asegurar que siempre
 * contenga la estructura { count, next, previous, results }.
 */
export function normalizePaginatedResponse(data) {
  if (!data) {
    return { count: 0, next: null, previous: null, results: [] };
  }

  // Si ya es el sobre paginado de PageNumberPagination de DRF
  if (Array.isArray(data.results)) {
    return {
      count: Number(data.count) || data.results.length,
      next: data.next || null,
      previous: data.previous || null,
      results: data.results,
    };
  }

  // Si el backend devolvió un array plano
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
 * Formatea recursivamente estructuras de error de Django REST Framework (strings, arrays
 * y serializadores anidados), evitando la aparición de '[object Object]'.
 */
export function formatDrfError(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    return data.map(formatDrfError).filter(Boolean).join(" ");
  }
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
 * Función base para peticiones HTTP con manejo estandarizado de encabezados y errores.
 */
export async function fetchApi(endpoint, options = {}) {
  const { params, headers = {}, token, ...customConfig } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  // Adjuntar parámetros de consulta (query params)
  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const defaultHeaders = {
    Accept: "application/json",
    ...headers,
  };

  // Solo agregar Content-Type: application/json si se envía body y no es FormData
  if (customConfig.body && !(customConfig.body instanceof FormData) && !defaultHeaders["Content-Type"]) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // Adjuntar token de autorización si se proporciona
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: defaultHeaders,
    });

    // Manejo de respuestas 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      // Extraer mensaje descriptivo devuelto por DRF
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;

      if (data && typeof data === "object") {
        const formatted = formatDrfError(data);
        if (formatted) errorMessage = formatted;
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || "Error de red al conectar con el servidor VELOX",
      0,
      null
    );
  }
}

/**
 * Métodos auxiliares para operaciones HTTP CRUD (R3)
 */
export const api = {
  get: (endpoint, options = {}) =>
    fetchApi(endpoint, { method: "GET", ...options }),

  getPaginated: async (endpoint, options = {}) => {
    const data = await fetchApi(endpoint, { method: "GET", ...options });
    return normalizePaginatedResponse(data);
  },

  post: (endpoint, body, options = {}) =>
    fetchApi(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  put: (endpoint, body, options = {}) =>
    fetchApi(endpoint, {
      method: "PUT",
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
