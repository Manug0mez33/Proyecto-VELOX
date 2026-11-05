import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { it, describe, expect, vi, beforeEach } from "vitest";
import LoginPage from "../login/page";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

const mockLoginAction = vi.fn();
vi.mock("../actions", () => ({
  loginAction: (...args) => mockLoginAction(...args),
}));

describe("Prueba de integración para: LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("debe enviar credenciales y redirigir al panel si la información es válida", async () => {
    mockLoginAction.mockResolvedValueOnce({
      success: true,
      access: "mock_jwt_token_123",
      username: "admin",
      es_personal_tienda: true,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("ej. cliente1 o admin"), {
      target: { value: "admin" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "passwordSeguro123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /ingresar a velox/i }));

    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledTimes(1);
      expect(mockLoginAction).toHaveBeenCalledWith({
        username: "admin",
        password: "passwordSeguro123",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
