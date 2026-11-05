import { describe, it, expect } from "vitest";
import { normalizePaginatedResponse } from "../../lib/api";

describe("Prueba de utilidades API: api.js (R3)", () => {
  it("normaliza respuestas paginadas asegurando estructura de resultados", () => {
    const rawData = [
      { id: 1, nombre: "VELOX AERO NITRO ELITE" },
      { id: 2, nombre: "VELOX HYPERION CARBON X" },
    ];

    const normalized = normalizePaginatedResponse(rawData);

    expect(normalized.count).toBe(2);
    expect(normalized.results).toHaveLength(2);
    expect(normalized.results[0].nombre).toBe("VELOX AERO NITRO ELITE");
  });
});
