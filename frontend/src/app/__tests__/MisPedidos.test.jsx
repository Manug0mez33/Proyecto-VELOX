import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MisPedidosPage from "../mis-pedidos/page";
import { api } from "../../lib/api";

const pedidoPendiente = {
  id: 7,
  estado: "PENDIENTE",
  estado_display: "Pendiente",
  metodo_pago: "TARJETA_CREDITO",
  metodo_pago_display: "Tarjeta de crédito",
  direccion_envio: "Av. Siempre Viva 742, Río Cuarto",
  total: "379998.00",
  fecha_creacion: "2026-10-31T10:00:00-03:00",
  detalles: [
    {
      id: 1,
      sku: "NK-PEG40-41-NEG",
      producto_nombre: "Air Zoom Pegasus 40",
      talle_detalle: "41 AR",
      color_nombre: "Negro",
      cantidad: 2,
      precio_unitario: "189999.00",
      subtotal: "379998.00",
    },
  ],
};

describe("Mis pedidos (/mis-pedidos) - vista del cliente", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("pide iniciar sesión si no hay token", async () => {
    render(<MisPedidosPage />);
    expect(await screen.findByText("Iniciá sesión")).toBeInTheDocument();
  });

  it("lista los pedidos del cliente con seguimiento, precio unitario y total", async () => {
    localStorage.setItem("velox_access_token", "token-cliente");
    const spy = vi.spyOn(api, "getPaginated").mockResolvedValueOnce({ count: 1, results: [pedidoPendiente] });

    render(<MisPedidosPage />);

    expect(await screen.findByText("PEDIDO VLX-PED-7")).toBeInTheDocument();
    expect(spy).toHaveBeenCalledWith("/pedidos/", expect.objectContaining({ token: "token-cliente" }));
    expect(screen.getByText("2 × $189.999")).toBeInTheDocument();
    expect(screen.getByText("TOTAL $379.998")).toBeInTheDocument();
    expect(screen.getByText("Recibido")).toHaveAttribute("aria-current", "step");
  });

  it("muestra el estado vacío cuando el cliente no tiene pedidos", async () => {
    localStorage.setItem("velox_access_token", "token-cliente");
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce({ count: 0, results: [] });

    render(<MisPedidosPage />);
    expect(await screen.findByText("TODAVÍA NO HICISTE PEDIDOS")).toBeInTheDocument();
  });

  it("permite cancelar un pedido pendiente tras confirmar", async () => {
    localStorage.setItem("velox_access_token", "token-cliente");
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce({ count: 1, results: [pedidoPendiente] });
    const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
      detail: "Pedido #7 cancelado correctamente.",
      pedido: { ...pedidoPendiente, estado: "CANCELADO", estado_display: "Cancelado" },
    });

    render(<MisPedidosPage />);
    fireEvent.click(await screen.findByText("Cancelar pedido"));
    fireEvent.click(screen.getByText("SÍ, CANCELAR"));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/pedidos/7/cancelar_pedido/", {}, { token: "token-cliente" });
      expect(screen.getByText("Pedido #7 cancelado correctamente.")).toBeInTheDocument();
      expect(screen.queryByText("Cancelar pedido")).not.toBeInTheDocument();
    });
  });
});
