import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PedidosPage from "../dashboard/pedidos/page";
import { api } from "../../lib/api";

describe("Dashboard Pedidos (/dashboard/pedidos - R1) - Listado Reactivo y Filtros", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const mockPedidosResponse = {
    count: 2,
    next: null,
    previous: null,
    results: [
      {
        id: 1,
        usuario: { id: 2, username: "cliente1", email: "cliente1@velox.com" },
        estado: "PENDIENTE",
        estado_display: "Pendiente",
        metodo_pago: "TARJETA_CREDITO",
        metodo_pago_display: "Tarjeta de Crédito",
        direccion_envio: "Av. Corrientes 1234, CABA",
        total: 99999,
        fecha_creacion: "2026-10-30T10:00:00Z",
        detalles: [
          {
            id: 10,
            sku: "VX-VSR-38-BLA",
            producto_nombre: "Velox Street Run",
            talle_detalle: "38 AR",
            color_nombre: "Blanco",
            cantidad: 1,
            precio_unitario: 99999,
            subtotal: 99999,
          },
        ],
      },
      {
        id: 2,
        usuario: { id: 2, username: "cliente1", email: "cliente1@velox.com" },
        estado: "ENTREGADO",
        estado_display: "Entregado",
        metodo_pago: "TRANSFERENCIA",
        metodo_pago_display: "Transferencia Bancaria",
        direccion_envio: "San Martín 500, Río Cuarto",
        total: 249999,
        fecha_creacion: "2026-10-29T15:00:00Z",
        detalles: [
          {
            id: 11,
            sku: "VX-VCX-39-NEG",
            producto_nombre: "Velox Carbon X",
            talle_detalle: "39 AR",
            color_nombre: "Negro",
            cantidad: 1,
            precio_unitario: 249999,
            subtotal: 249999,
          },
        ],
      },
    ],
  };

  it("muestra el banner de sesión requerida cuando no hay token en localStorage", async () => {
    render(<PedidosPage />);

    expect(
      screen.getByText("GESTIÓN DE PEDIDOS")
    ).toBeInTheDocument();
    expect(
      screen.getByText("INICIO DE SESIÓN REQUERIDO")
    ).toBeInTheDocument();
    expect(screen.getByText("INICIAR SESIÓN AHORA →")).toBeInTheDocument();
  });

  it("consume GET /api/pedidos/ con JWT y renderiza la lista de órdenes de compra", async () => {
    localStorage.setItem("velox_access_token", "fake_jwt_token_123");
    localStorage.setItem("velox_username", "cliente1");

    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockPedidosResponse);

    render(<PedidosPage />);

    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
      expect(screen.getByText("#2")).toBeInTheDocument();
    });

    expect(screen.getByText("Velox Street Run")).toBeInTheDocument();
    expect(screen.getByText("Velox Carbon X")).toBeInTheDocument();
    expect(screen.getByText("$99.999")).toBeInTheDocument();
    expect(screen.getByText("$249.999")).toBeInTheDocument();
  });

  it("permite filtrar los pedidos reactivamente por estado", async () => {
    localStorage.setItem("velox_access_token", "fake_jwt_token_123");
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockPedidosResponse);

    render(<PedidosPage />);

    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
      expect(screen.getByText("#2")).toBeInTheDocument();
    });

    // Filtrar por ENTREGADOS
    const botonEntregados = screen.getByRole("tab", { name: /ENTREGADOS/i });
    fireEvent.click(botonEntregados);

    // Solo debe verse el pedido #2
    expect(screen.queryByText("#1")).not.toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();

    // Filtrar por PENDIENTES
    const botonPendientes = screen.getByRole("tab", { name: /PENDIENTES/i });
    fireEvent.click(botonPendientes);

    // Solo debe verse el pedido #1
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.queryByText("#2")).not.toBeInTheDocument();
  });

  it("filtra pedidos mediante la barra de búsqueda por texto o SKU", async () => {
    localStorage.setItem("velox_access_token", "fake_jwt_token_123");
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockPedidosResponse);

    render(<PedidosPage />);

    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
    });

    const inputBusqueda = screen.getByPlaceholderText(/Buscar por ID, referencia o cliente.../i);
    fireEvent.change(inputBusqueda, { target: { value: "Carbon X" } });

    expect(screen.queryByText("#1")).not.toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
  });

  it("muestra el empty state cuando no hay pedidos coincidentes", async () => {
    localStorage.setItem("velox_access_token", "fake_jwt_token_123");
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockPedidosResponse);

    render(<PedidosPage />);

    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
    });

    // Filtrar por CANCELADOS (no hay ninguno)
    const botonCancelados = screen.getByRole("tab", { name: /CANCELADOS/i });
    fireEvent.click(botonCancelados);

    expect(screen.getByText("NO SE ENCONTRARON PEDIDOS")).toBeInTheDocument();
  });

  it("cada fila contiene un enlace que apunta a la 2da ruta dinámica /dashboard/pedidos/[id]", async () => {
    localStorage.setItem("velox_access_token", "fake_jwt_token_123");
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockPedidosResponse);

    render(<PedidosPage />);

    await waitFor(() => {
      expect(screen.getByText("#1")).toBeInTheDocument();
    });

    const enlaces = screen.getAllByRole("link", { name: /VER FICHA →/i });
    expect(enlaces[0]).toHaveAttribute("href", "/dashboard/pedidos/1");
    expect(enlaces[1]).toHaveAttribute("href", "/dashboard/pedidos/2");
  });
});
