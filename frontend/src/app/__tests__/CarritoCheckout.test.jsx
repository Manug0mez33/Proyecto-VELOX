import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CarritoPage from "../carrito/page";
import { CartProvider, useCart } from "../../context/CartContext";
import { useEffect } from "react";
import { api, ApiError } from "../../lib/api";

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

describe("Carrito & Checkout Form - Integración React Hook Form + Zod", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const sampleProduct = {
    id: 54,
    variante_id: 54,
    sku: "VX-VSR-38-BLA",
    nombre: "Velox Street Run",
    marca: "VELOX Performance",
    categoria: "Urbano",
    talle: "38",
    color: "Blanco",
    precio_final: 99999,
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

  it("abre el modal de checkout al hacer click en 'FINALIZAR PEDIDO'", async () => {
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    const checkoutBtn = screen.getByRole("button", { name: /FINALIZAR PEDIDO/i });
    fireEvent.click(checkoutBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("FINALIZAR PEDIDO")).toBeInTheDocument();
    });
  });

  it("muestra el banner destacado de aviso de inicio de sesión cuando no hay token en localStorage", async () => {
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /FINALIZAR PEDIDO/i }));

    await waitFor(() => {
      expect(screen.getByTestId("auth-required-banner")).toBeInTheDocument();
      expect(screen.getAllByText(/INICIO DE SESIÓN REQUERIDO/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole("link", { name: /INICIAR SESIÓN/i })).toHaveAttribute("href", "/login");
    });
  });

  it("valida campos obligatorios con Zod al enviar el formulario vacío", async () => {
    localStorage.setItem("velox_access_token", "fake-jwt-token-val");

    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /FINALIZAR PEDIDO/i }));

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

  it("detiene el envío y muestra mensaje de error si el usuario no tiene token", async () => {
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /FINALIZAR PEDIDO/i }));

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
      expect(screen.getByTestId("checkout-error-box")).toBeInTheDocument();
      expect(screen.getByText(/Debes iniciar sesión antes de confirmar la compra/i)).toBeInTheDocument();
    });
  });

  it("completa la orden exitosamente al conectar con POST /api/pedidos/ con token, vacía el carrito y muestra datos del backend", async () => {
    localStorage.setItem("velox_access_token", "jwt-auth-token-xyz");

    const apiPostSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
      id: 77,
      metodo_pago: "TARJETA_CREDITO",
      direccion_envio: "Boulevard Roca 1234, Río Cuarto, CP 5800",
      total: "99999.00",
      estado: "PENDIENTE",
      fecha_creacion: "2026-10-30T15:30:00Z",
    });

    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /FINALIZAR PEDIDO/i }));

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
      expect(apiPostSpy).toHaveBeenCalledWith(
        "/pedidos/",
        expect.objectContaining({
          direccion_envio: "Boulevard Roca 1234, Río Cuarto, CP 5800",
          metodo_pago: "TARJETA_CREDITO",
        }),
        { token: "jwt-auth-token-xyz" }
      );
    });

    await waitFor(() => {
      expect(screen.getByText("¡ORDEN REGISTRADA EXITOSAMENTE!")).toBeInTheDocument();
      expect(screen.getByText("VLX-PED-77")).toBeInTheDocument();
    });
  });

  it("captura errores estructurados de validación devueltos por el backend y los muestra", async () => {
    localStorage.setItem("velox_access_token", "jwt-auth-token-xyz");

    vi.spyOn(api, "post").mockRejectedValueOnce(
      new ApiError("No hay suficiente stock para la variante seleccionada.", 400)
    );

    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /FINALIZAR PEDIDO/i }));

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
      expect(screen.getByTestId("checkout-error-box")).toBeInTheDocument();
      expect(
        screen.getByText(/No hay suficiente stock para la variante seleccionada\./i)
      ).toBeInTheDocument();
    });
  });

  it("permite vaciar el carrito completo mediante el modal de confirmación", async () => {
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    const vaciarBtn = screen.getByRole("button", { name: /VACIAR CARRITO/i });
    fireEvent.click(vaciarBtn);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("¿VACIAR CARRITO?")).toBeInTheDocument();

    const confirmarVaciarBtn = screen.getByRole("button", { name: /SÍ, VACIAR CARRITO/i });
    fireEvent.click(confirmarVaciarBtn);

    await waitFor(() => {
      expect(screen.getByText("TU CARRITO ESTÁ VACÍO")).toBeInTheDocument();
    });
  });
});
