import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../context/CartContext";

describe("Prueba de estado global: CartContext (R6)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  it("agrega un producto al carrito y actualiza totalItems y subtotal", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(
        {
          id: 1,
          sku: "VLX-AER-41-NEO",
          nombre: "VELOX AERO NITRO ELITE",
          precio_final: 189500,
          talle_seleccionado: "41",
        },
        1
      );
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].sku).toBe("VLX-AER-41-NEO");
    expect(result.current.totalItems).toBe(1);
    expect(result.current.subtotal).toBe(189500);
  });
});
