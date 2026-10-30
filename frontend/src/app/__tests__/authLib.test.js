import { describe, it, expect } from "vitest";
import { parseJwt, isTokenExpired } from "../../lib/auth";

describe("Módulo de autenticación (src/lib/auth.js)", () => {
  // Helper para generar tokens JWT simulados (header.payload.signature)
  const createMockToken = (payload) => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const encodedPayload = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `${header}.${encodedPayload}.signature_mock`;
  };

  describe("parseJwt()", () => {
    it("retorna null si el token es nulo, indefinido o no es string", () => {
      expect(parseJwt(null)).toBeNull();
      expect(parseJwt(undefined)).toBeNull();
      expect(parseJwt("")).toBeNull();
      expect(parseJwt(12345)).toBeNull();
    });

    it("retorna null si el token no tiene 3 partes separadas por puntos", () => {
      expect(parseJwt("invalido")).toBeNull();
      expect(parseJwt("parte1.parte2")).toBeNull();
      expect(parseJwt("parte1.parte2.parte3.parte4")).toBeNull();
    });

    it("decodifica correctamente un token JWT válido con datos de usuario", () => {
      const mockPayload = {
        user_id: 42,
        username: "atleta_velox",
        rol: "CLIENTE",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = createMockToken(mockPayload);
      const decoded = parseJwt(token);

      expect(decoded).not.toBeNull();
      expect(decoded.user_id).toBe(42);
      expect(decoded.username).toBe("atleta_velox");
      expect(decoded.rol).toBe("CLIENTE");
    });
  });

  describe("isTokenExpired()", () => {
    it("retorna true si el token es inválido o no posee claim 'exp'", () => {
      expect(isTokenExpired("")).toBe(true);
      expect(isTokenExpired("token.invalido.aqui")).toBe(true);

      const tokenSinExp = createMockToken({ username: "sin_exp" });
      expect(isTokenExpired(tokenSinExp)).toBe(true);
    });

    it("retorna true si la fecha de expiración es pasada", () => {
      const expPasado = Math.floor(Date.now() / 1000) - 300; // expiró hace 5 minutos
      const tokenExpirado = createMockToken({ username: "admin", exp: expPasado });
      expect(isTokenExpired(tokenExpirado)).toBe(true);
    });

    it("retorna false si el token se encuentra vigente", () => {
      const expFuturo = Math.floor(Date.now() / 1000) + 7200; // vence en 2 horas
      const tokenVigente = createMockToken({ username: "admin", exp: expFuturo });
      expect(isTokenExpired(tokenVigente)).toBe(false);
    });
  });
});
