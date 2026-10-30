import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CarritoPage from "../carrito/page";
import { CartProvider, useCart } from "../../context/CartContext";
import { useEffect } from "react";

// Componente wrapper para inicializar el carrito con un producto de prueba
function CarritoTestWrapper({ children, initialItem = null }) {
  return (
    <CartProvider>
      {initialItem && <CartInitializer item={initialItem} />}
      {children}
    </CartProvider>
  );
}

function CartInitializer({ item }) {
  const { addToCart } = useCart();
  useEffect(() => {
    addToCart(item, 1);
  }, [addToCart, item]);
  return null;
}

describe("Carrito & Checkout Form (R5 & R6) - Integración React Hook Form + Zod", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const sampleProduct = {
    id: 1,
    sku: "VLX-AER-41-NEO",
    nombre: "VELOX AERO NITRO ELITE",
    marca: "VELOX LAB",
    categoria: "COMPETICIÓN",
    talle: "41",
    color: "NEO GREEN",
    precio_final: 189500,
  };

  it("muestra el carrito vacío inicialmente si no hay productos agregados", async () => {
    render(
      <CarritoTestWrapper>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("TU CARRITO ESTÁ VACÍO")).toBeInTheDocument();
    });
  });

  it("abre el modal de checkout al hacer click en 'PROCEDER AL CHECKOUT'", async () => {
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("VELOX AERO NITRO ELITE")).toBeInTheDocument();
    });

    const checkoutBtn = screen.getByRole("button", { name: /PROCEDER AL CHECKOUT/i });
    fireEvent.click(checkoutBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("FINALIZAR PEDIDO (CHECKOUT R5)")).toBeInTheDocument();
    });
  });

  it("valida campos obligatorios con Zod al enviar el formulario vacío", async () => {
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("VELOX AERO NITRO ELITE")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /PROCEDER AL CHECKOUT/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole("button", { name: /CONFIRMAR COMPRA/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("La dirección de envío es obligatoria.")).toBeInTheDocument();
      expect(screen.getByText("La ciudad es obligatoria.")).toBeInTheDocument();
      expect(screen.getByText("El código postal es obligatorio.")).toBeInTheDocument();
      expect(screen.getByText("El teléfono de contacto es obligatorio.")).toBeInTheDocument();
    });
  });

  it("completa la orden exitosamente al ingresar datos válidos y vacía el carrito", async () => {
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("VELOX AERO NITRO ELITE")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /PROCEDER AL CHECKOUT/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Dirección de Envío/i), {
      target: { value: "Boulevard Roca 1234" },
    });
    fireEvent.change(screen.getByLabelText(/Ciudad/i), {
      target: { value: "Río Cuarto" },
    });
    fireEvent.change(screen.getByLabelText(/Código Postal/i), {
      target: { value: "5800" },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono de Contacto/i), {
      target: { value: "3584998877" },
    });

    const submitBtn = screen.getByRole("button", { name: /CONFIRMAR COMPRA/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("¡ORDEN REGISTRADA EXITOSAMENTE!")).toBeInTheDocument();
      expect(screen.getByText(/NÚMERO DE ORDEN:/i)).toBeInTheDocument();
      expect(screen.getByText(/Boulevard Roca 1234/i)).toBeInTheDocument();
    });

    // Cerrar el modal de confirmación
    const finalizeBtn = screen.getByRole("button", { name: /FINALIZAR Y CONTINUAR/i });
    fireEvent.click(finalizeBtn);

    // Al finalizar, el carrito debe estar vacío
    await waitFor(() => {
      expect(screen.getByText("TU CARRITO ESTÁ VACÍO")).toBeInTheDocument();
    });
  });
});
