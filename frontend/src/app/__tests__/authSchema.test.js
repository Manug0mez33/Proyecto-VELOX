import { describe, it, expect } from "vitest";
import { loginSchema } from "../../validations/authSchema";

describe("Prueba de validación Zod: authSchema (R5)", () => {
  it("valida exitosamente credenciales correctas y rechaza campos incompletos", () => {
    // Caso válido
    const validData = {
      username: "admin_velox",
      password: "passwordSeguro123",
    };
    const validResult = loginSchema.safeParse(validData);
    expect(validResult.success).toBe(true);

    // Caso inválido (longitud insuficiente)
    const invalidData = {
      username: "ab",
      password: "123",
    };
    const invalidResult = loginSchema.safeParse(invalidData);
    expect(invalidResult.success).toBe(false);
    expect(invalidResult.error.issues.length).toBeGreaterThan(0);
  });
});
