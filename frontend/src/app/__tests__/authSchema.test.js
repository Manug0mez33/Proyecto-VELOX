import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "../../validations/authSchema";

describe("authSchema (R5) - Validación Zod en snake_case para Autenticación", () => {
  describe("loginSchema", () => {
    it("acepta credenciales válidas en snake_case", () => {
      const validData = {
        username: "tomas_benavidez",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe("tomas_benavidez");
      }
    });

    it("falla si el nombre de usuario tiene menos de 3 caracteres", () => {
      const invalidData = {
        username: "ab",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain("al menos 3 caracteres");
    });

    it("falla si la contraseña tiene menos de 8 caracteres", () => {
      const invalidData = {
        username: "admin_velox",
        password: "12345",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain("al menos 8 caracteres");
    });
  });

  describe("registerSchema", () => {
    it("valida exitosamente el alta con campos snake_case requeridos y opcionales", () => {
      const validCustomer = {
        username: "atleta_cordoba",
        email: "atleta@velox.com",
        password: "superPassword123",
        confirm_password: "superPassword123",
        first_name: "Carlos",
        last_name: "Pérez",
        telefono: "3584123456",
        direccion: "Av. San Martín 450",
        ciudad: "Río Cuarto",
      };

      const result = registerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("atleta@velox.com");
      }
    });

    it("falla si confirm_password no coincide con password", () => {
      const mismatchData = {
        username: "atleta_velox",
        email: "atleta@velox.com",
        password: "password123",
        confirm_password: "differentPassword123",
      };

      const result = registerSchema.safeParse(mismatchData);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Las contraseñas no coinciden.");
      expect(result.error.issues[0].path).toContain("confirm_password");
    });

    it("falla si el email posee formato inválido", () => {
      const invalidEmail = {
        username: "usuario1",
        email: "email-invalido-sin-arroba",
        password: "password123",
        confirm_password: "password123",
      };

      const result = registerSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain("correo electrónico válido");
    });
  });
});
