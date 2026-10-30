import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../context/CartContext";

describe("CartContext (R6) - Gestión de Estado Global del Carrito", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  it("debe lanzar un error descriptivo si useCart se invoca fuera de CartProvider", () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow("useCart debe ser utilizado dentro de un <CartProvider>");
  });

  it("inicializa con carrito vacío, totalItems 0 y subtotal 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it("agrega un producto nuevo al carrito y actualiza totalItems y subtotal", () => {
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
    expect(result.current.items[0].cantidad).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.subtotal).toBe(189500);
  });

  it("incrementa la cantidad si se agrega el mismo SKU repetidamente", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(
        {
          id: 1,
          sku: "VLX-AER-41-NEO",
          nombre: "VELOX AERO NITRO ELITE",
          precio_final: 189500,
        },
        2
      );
    });

    act(() => {
      result.current.addToCart(
        {
          id: 1,
          sku: "VLX-AER-41-NEO",
          nombre: "VELOX AERO NITRO ELITE",
          precio_final: 189500,
        },
        3
      );
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].cantidad).toBe(5);
    expect(result.current.totalItems).toBe(5);
    expect(result.current.subtotal).toBe(189500 * 5);
  });

  it("permite actualizar la cantidad de un producto o removerlo si es 0", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(
        {
          id: 2,
          sku: "VLX-VOR-42",
          nombre: "VELOX VORTEX PRO X2",
          precio_final: 214000,
        },
        2
      );
    });

    act(() => {
      result.current.updateQuantity("VLX-VOR-42", 4);
    });
    expect(result.current.items[0].cantidad).toBe(4);
    expect(result.current.totalItems).toBe(4);

    // Cantidad 0 debe remover el ítem
    act(() => {
      result.current.updateQuantity("VLX-VOR-42", 0);
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it("elimina un producto por SKU con removeFromCart()", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(
        { id: 1, sku: "SKU-1", nombre: "A", precio_final: 1000 },
        1
      );
      result.current.addToCart(
        { id: 2, sku: "SKU-2", nombre: "B", precio_final: 2000 },
        1
      );
    });

    expect(result.current.items).toHaveLength(2);

    act(() => {
      result.current.removeFromCart("SKU-1");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].sku).toBe("SKU-2");
    expect(result.current.totalItems).toBe(1);
    expect(result.current.subtotal).toBe(2000);
  });

  it("vacía completamente el carrito con clearCart()", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(
        { id: 1, sku: "SKU-1", nombre: "A", precio_final: 1000 },
        2
      );
    });

    expect(result.current.totalItems).toBe(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("sincroniza el carrito automáticamente cuando otra pestaña dispara un evento de storage", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const externalItems = [
      { id: 99, sku: "EXT-SKU-99", nombre: "VELOX CARBON TAB 2", precio: 220000, cantidad: 3 },
    ];

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "velox_cart",
          newValue: JSON.stringify(externalItems),
        })
      );
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].sku).toBe("EXT-SKU-99");
    expect(result.current.totalItems).toBe(3);
    expect(result.current.subtotal).toBe(660000);
  });
});
