import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PedidoDetalleClient from "../../components/PedidoDetalleClient";
import { api } from "../../lib/api";

describe("PedidoDetalleClient (2da Ruta Dinámica /dashboard/pedidos/[id] - R1) & @action cancelar_pedido", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const mockPedidoPendiente = {
    id: 1,
    usuario: { id: 2, username: "cliente1", email: "cliente1@velox.com", rol: "CLIENTE" },
    estado: "PENDIENTE",
    estado_display: "Pendiente",
    metodo_pago: "TARJETA_CREDITO",
    metodo_pago_display: "Tarjeta de Crédito",
    direccion_envio: "Av. Corrientes 1234, CABA",
    total: 99999,
    fecha_creacion: "2026-10-30T10:00:00Z",
    actualizado_en: "2026-10-30T10:00:00Z",
    detalles: [
      {
        id: 10,
        sku: "VX-VSR-38-BLA",
        producto_nombre: "Velox Street Run",
        talle_detalle: "38 AR",
        color_nombre: "Blanco",
        color_hex: "#FFFFFF",
        cantidad: 1,
        precio_unitario: 99999,
        subtotal: 99999,
      },
    ],
  };

  const mockPedidoCancelado = {
    ...mockPedidoPendiente,
    estado: "CANCELADO",
    estado_display: "Cancelado",
  };

  it("renderiza la información completa del pedido y el desglose de calzados (SKU)", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce(mockPedidoPendiente);

    render(<PedidoDetalleClient id={1} />);

    await waitFor(() => {
      expect(screen.getByText("ORDEN DE COMPRA #1")).toBeInTheDocument();
    });

    // Datos del cliente y entrega
    expect(screen.getByText("cliente1")).toBeInTheDocument();
    expect(screen.getByText("cliente1@velox.com")).toBeInTheDocument();
    expect(screen.getByText("Av. Corrientes 1234, CABA")).toBeInTheDocument();

    // Desglose de calzado y SKU
    expect(screen.getByText("VX-VSR-38-BLA")).toBeInTheDocument();
    expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    expect(screen.getByText("38 AR")).toBeInTheDocument();
    expect(screen.getAllByText("$99.999").length).toBeGreaterThanOrEqual(1);
  });

  it("muestra el botón de cancelación cuando el pedido está en estado PENDIENTE", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce(mockPedidoPendiente);

    render(<PedidoDetalleClient id={1} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /CANCELAR PEDIDO \(@ACTION\)/i })
      ).toBeInTheDocument();
    });
  });

  it("abre el modal de confirmación y ejecuta la acción POST /api/pedidos/{id}/cancelar_pedido/", async () => {
    localStorage.setItem("velox_access_token", "fake_token_jwt");
    vi.spyOn(api, "get").mockResolvedValueOnce(mockPedidoPendiente);

    const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
      detail: "Pedido #1 cancelado correctamente. Se restituyó el stock de los artículos.",
      pedido: mockPedidoCancelado,
    });

    render(<PedidoDetalleClient id={1} />);

    await waitFor(() => {
      expect(screen.getByText("ORDEN DE COMPRA #1")).toBeInTheDocument();
    });

    // Click en cancelar pedido
    const btnCancelar = screen.getByRole("button", { name: /CANCELAR PEDIDO \(@ACTION\)/i });
    fireEvent.click(btnCancelar);

    // Modal debe estar visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("CANCELAR PEDIDO #1")).toBeInTheDocument();
    expect(
      screen.getByText(/POST \/api\/pedidos\/1\/cancelar_pedido\//i)
    ).toBeInTheDocument();

    // Confirmar en el modal
    const btnConfirmar = screen.getByRole("button", { name: /SÍ, CANCELAR PEDIDO/i });
    fireEvent.click(btnConfirmar);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        "/pedidos/1/cancelar_pedido/",
        {},
        { token: "fake_token_jwt" }
      );
    });

    // Feedback de éxito
    await waitFor(() => {
      expect(
        screen.getByText(/Pedido #1 cancelado correctamente/i)
      ).toBeInTheDocument();
    });

    // El botón ya no debe estar disponible para un pedido cancelado
    expect(
      screen.queryByRole("button", { name: /CANCELAR PEDIDO \(@ACTION\)/i })
    ).not.toBeInTheDocument();
  });

  it("no muestra el botón de cancelar si el pedido ya está en estado CANCELADO", async () => {
    vi.spyOn(api, "get").mockResolvedValueOnce(mockPedidoCancelado);

    render(<PedidoDetalleClient id={1} />);

    await waitFor(() => {
      expect(screen.getByText("ORDEN DE COMPRA #1")).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("button", { name: /CANCELAR PEDIDO \(@ACTION\)/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/PEDIDO CANCELADO:/i)).toBeInTheDocument();
  });
});
