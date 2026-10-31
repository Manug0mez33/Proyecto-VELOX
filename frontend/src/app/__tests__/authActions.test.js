import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock de next/headers (cookies) y next/cache (revalidatePath)
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Importar Server Actions luego de configurar los mocks
import { loginAction, logoutAction, getAuthSessionAction } from "../actions";

describe("Server Actions de autenticación (src/app/actions.js)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("loginAction()", () => {
    it("retorna error si los campos no cumplen el esquema Zod", async () => {
      const result = await loginAction({ username: "", password: "" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("obligatorio");
    });

    it("retorna error si el backend responde con 401 Unauthorized", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: "No active account found with the given credentials" }),
      });

      const result = await loginAction({
        username: "usuario_inexistente",
        password: "password123",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No existe una cuenta activa");
    });

    it("autentica exitosamente y establece las Cookies HTTP-Only con flags seguros", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access: "mock_jwt_access_token_12345",
          refresh: "mock_jwt_refresh_token_67890",
        }),
      });

      const result = await loginAction({
        username: "admin",
        password: "passwordSeguro123",
      });

      expect(result.success).toBe(true);
      expect(result.access).toBe("mock_jwt_access_token_12345");
      expect(result.username).toBe("admin");

      // Verificar que se hayan establecido las cookies HTTP-Only
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "velox_access_token",
        "mock_jwt_access_token_12345",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "velox_refresh_token",
        "mock_jwt_refresh_token_67890",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );
    });
  });

  describe("logoutAction()", () => {
    it("elimina las Cookies de autenticación y revalida las rutas", async () => {
      const result = await logoutAction();

      expect(result.success).toBe(true);
      expect(mockCookieStore.delete).toHaveBeenCalledWith("velox_access_token");
      expect(mockCookieStore.delete).toHaveBeenCalledWith("velox_refresh_token");
      expect(mockCookieStore.delete).toHaveBeenCalledWith("velox_username");
    });
  });

  describe("getAuthSessionAction()", () => {
    it("retorna isAuthenticated: false si no existe cookie de acceso", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const session = await getAuthSessionAction();
      expect(session.isAuthenticated).toBe(false);
      expect(session.username).toBeNull();
    });

    it("retorna isAuthenticated: true y el username si la cookie está presente", async () => {
      mockCookieStore.get.mockImplementation((name) => {
        if (name === "velox_access_token") return { value: "token_activo" };
        if (name === "velox_username") return { value: "admin_velox" };
        return undefined;
      });

      const session = await getAuthSessionAction();
      expect(session.isAuthenticated).toBe(true);
      expect(session.username).toBe("admin_velox");
    });
  });
});
