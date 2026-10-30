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

describe("Carrito & Checkout Form (R5 & R6) - Integración React Hook Form + Zod + DRF POST /api/pedidos/", () => {
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

  it("abre el modal de checkout al hacer click en 'PROCEDER AL CHECKOUT'", async () => {
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    const checkoutBtn = screen.getByRole("button", { name: /PROCEDER AL CHECKOUT/i });
    fireEvent.click(checkoutBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("FINALIZAR PEDIDO (CHECKOUT R5)")).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: /PROCEDER AL CHECKOUT/i }));

    await waitFor(() => {
      expect(screen.getByTestId("auth-required-banner")).toBeInTheDocument();
      expect(screen.getByText(/AUTENTICACIÓN REQUERIDA \(JWT\)/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /INICIAR SESIÓN AHORA/i })).toHaveAttribute("href", "/login");
    });
  });

  it("valida campos obligatorios con Zod al enviar el formulario vacío", async () => {
    // Simulamos usuario autenticado para probar la validación de campos del formulario
    localStorage.setItem("velox_access_token", "fake-jwt-token-val");

    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
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

  it("detiene el envío y muestra mensaje de error si el usuario no tiene token JWT", async () => {
    // Sin token en localStorage
    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /PROCEDER AL CHECKOUT/i }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Rellenamos campos para superar la validación Zod y probar el guard de autenticación
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
      direccion_envio: "Boulevard Roca 1234 - Río Cuarto - CP: 5800 - Tel: 3584998877",
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
      expect(apiPostSpy).toHaveBeenCalledWith(
        "/pedidos/",
        expect.objectContaining({
          metodo_pago: "TARJETA_CREDITO",
          detalles: [{ variante: 54, cantidad: 1 }],
        }),
        expect.objectContaining({
          token: "jwt-auth-token-xyz",
        })
      );
      expect(screen.getByText("¡ORDEN REGISTRADA EXITOSAMENTE!")).toBeInTheDocument();
      expect(screen.getByText(/NÚMERO DE ORDEN:/i)).toBeInTheDocument();
      expect(screen.getByText(/ID #77/i)).toBeInTheDocument();
    });

    // Cerrar el modal de confirmación
    const finalizeBtn = screen.getByRole("button", { name: /FINALIZAR Y CONTINUAR/i });
    fireEvent.click(finalizeBtn);

    // Al finalizar, el carrito debe estar vacío
    await waitFor(() => {
      expect(screen.getByText("TU CARRITO ESTÁ VACÍO")).toBeInTheDocument();
    });
  });

  it("captura y despliega error de stock insuficiente (400) de DRF en el modal sin romper la interfaz", async () => {
    localStorage.setItem("velox_access_token", "jwt-auth-token-xyz");

    vi.spyOn(api, "post").mockRejectedValueOnce(
      new ApiError(
        "Stock insuficiente para 'VX-VSR-38-BLA'. Disponible: 0 u., solicitado: 1 u.",
        400,
        { detalles: ["Stock insuficiente para 'VX-VSR-38-BLA'."] }
      )
    );

    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
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
      expect(screen.getByTestId("checkout-error-box")).toBeInTheDocument();
      expect(screen.getByText(/Stock insuficiente para 'VX-VSR-38-BLA'/i)).toBeInTheDocument();
      // El formulario permanece en pantalla para permitir corregir o reintentar
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("captura y despliega error de sesión expirada (401) de DRF en el modal", async () => {
    localStorage.setItem("velox_access_token", "expired-token");

    vi.spyOn(api, "post").mockRejectedValueOnce(
      new ApiError("Las credenciales de autenticación no fueron provistas.", 401)
    );

    render(
      <CarritoTestWrapper initialItem={sampleProduct}>
        <CarritoPage />
      </CarritoTestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
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
      expect(screen.getByTestId("checkout-error-box")).toBeInTheDocument();
      expect(screen.getByText(/Tu sesión ha expirado o las credenciales JWT no son válidas/i)).toBeInTheDocument();
    });
  });
});
