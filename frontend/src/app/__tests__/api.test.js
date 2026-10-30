import { describe, it, expect } from "vitest";
import { normalizePaginatedResponse, ApiError } from "../../lib/api";

describe("api helper (R3) - Normalización del sobre paginado DRF y Manejo de Errores", () => {
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
