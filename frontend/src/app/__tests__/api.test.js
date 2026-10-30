import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { normalizePaginatedResponse, ApiError, fetchApi, api } from "../../lib/api";

describe("api helper (R3) - Normalización del sobre paginado DRF y Manejo de Errores", () => {
  describe("normalizePaginatedResponse", () => {
    it("normaliza correctamente la respuesta paginada de DRF con { count, next, previous, results }", () => {
      const drfResponse = {
        count: 58,
        next: "http://localhost:8000/api/productos/?page=2",
        previous: null,
        results: [
          { id: 1, nombre: "VELOX AERO NITRO", precio_base: "189500.00" },
          { id: 2, nombre: "VELOX VORTEX PRO", precio_base: "214000.00" },
        ],
      };

      const normalized = normalizePaginatedResponse(drfResponse);

      expect(normalized.count).toBe(58);
      expect(normalized.next).toBe("http://localhost:8000/api/productos/?page=2");
      expect(normalized.previous).toBeNull();
      expect(normalized.results).toHaveLength(2);
      expect(normalized.results[0].nombre).toBe("VELOX AERO NITRO");
    });

    it("normaliza una respuesta en array plano hacia el sobre estándar", () => {
      const rawArray = [
        { id: 10, nombre: "Item A" },
        { id: 20, nombre: "Item B" },
        { id: 30, nombre: "Item C" },
      ];

      const normalized = normalizePaginatedResponse(rawArray);

      expect(normalized.count).toBe(3);
      expect(normalized.next).toBeNull();
      expect(normalized.previous).toBeNull();
      expect(normalized.results).toEqual(rawArray);
    });

    it("retorna una estructura segura vacía si recibe null o undefined", () => {
      expect(normalizePaginatedResponse(null)).toEqual({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });
      expect(normalizePaginatedResponse(undefined)).toEqual({
        count: 0,
        next: null,
        previous: null,
        results: [],
      });
    });
  });

  describe("ApiError", () => {
    it("crea instancias de ApiError con status y estructura de error", () => {
      const errorData = { sku: ["Ya existe una variante con este SKU."] };
      const apiError = new ApiError("Error de validación DRF", 400, errorData);

      expect(apiError).toBeInstanceOf(Error);
      expect(apiError.name).toBe("ApiError");
      expect(apiError.message).toBe("Error de validación DRF");
      expect(apiError.status).toBe(400);
      expect(apiError.data).toEqual(errorData);
    });
  });

  describe("fetchApi y operaciones CRUD (api.*)", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it("ejecuta api.get exitosamente retornando datos JSON", async () => {
      const mockData = { id: 1, nombre: "VELOX CARBON" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => mockData,
      });

      const result = await api.get("/productos/1/");
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/productos/1/"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("ejecuta api.getPaginated retornando estructura normalizada", async () => {
      const mockPaginated = {
        count: 1,
        next: null,
        previous: null,
        results: [{ id: 1, nombre: "Calzado" }],
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => mockPaginated,
      });

      const result = await api.getPaginated("/productos/");
      expect(result.count).toBe(1);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].nombre).toBe("Calzado");
    });

    it("ejecuta api.post enviando payload en JSON y encabezado Content-Type", async () => {
      const postPayload = { direccion_envio: "Calle 123", metodo_pago: "TARJETA" };
      const responsePayload = { id: 10, ...postPayload };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: { get: () => "application/json" },
        json: async () => responsePayload,
      });

      const result = await api.post("/pedidos/", postPayload);
      expect(result).toEqual(responsePayload);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/pedidos/"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(postPayload),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
        })
      );
    });

    it("retorna null ante respuestas 204 No Content (DELETE)", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: { get: () => null },
      });

      const result = await api.delete("/productos/1/");
      expect(result).toBeNull();
    });

    it("adjunta query params y encabezado Bearer token en las opciones", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => [],
      });

      await fetchApi("/productos/", {
        params: { categoria: "competicion", page: 2 },
        token: "jwt-token-12345",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("categoria=competicion&page=2"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer jwt-token-12345",
          }),
        })
      );
    });

    it("captura errores 400 de DRF extrayendo el diccionario de campos", async () => {
      const drfFieldErrors = {
        direccion_envio: ["Este campo es requerido."],
        metodo_pago: ["Opción inválida."],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: { get: () => "application/json" },
        json: async () => drfFieldErrors,
      });

      await expect(api.post("/pedidos/", {})).rejects.toThrow(ApiError);
      await expect(api.post("/pedidos/", {})).rejects.toMatchObject({
        status: 400,
        data: drfFieldErrors,
      });
    });

    it("captura errores 401 de DRF extrayendo el mensaje detail", async () => {
      const drfAuthError = {
        detail: "Las credenciales de autenticación no fueron provistas.",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: { get: () => "application/json" },
        json: async () => drfAuthError,
      });

      await expect(api.get("/pedidos/")).rejects.toThrow(
        "Las credenciales de autenticación no fueron provistas."
      );
    });

    it("formatea adecuadamente errores anidados de serializadores en listas/diccionarios sin devolver [object Object]", async () => {
      const drfNestedErrors = {
        detalles: [{ variante: ["Clave primaria 99999 inválida - objeto no existe."] }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: { get: () => "application/json" },
        json: async () => drfNestedErrors,
      });

      try {
        await api.post("/pedidos/", {});
        expect.unreachable("Debería lanzar ApiError");
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.message).toBe("detalles: variante: Clave primaria 99999 inválida - objeto no existe.");
        expect(err.message).not.toContain("[object Object]");
      }
    });

    it("maneja errores de red envolviéndolos en ApiError con status 0", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

      await expect(api.get("/productos/")).rejects.toMatchObject({
        name: "ApiError",
        status: 0,
        message: "Failed to fetch",
      });
    });
  });
});
