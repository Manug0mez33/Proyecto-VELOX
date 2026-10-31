import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import DashboardPage from "../dashboard/page";
import { api } from "../../lib/api";

describe("DashboardPage (/dashboard) - KPIs Reactivos de Inventario", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const mockVariantes = {
    count: 2,
    next: null,
    previous: null,
    results: [
      {
        id: 44,
        sku: "VX-VCX-39-NEG",
        producto: 6,
        producto_nombre: "Velox Carbon X",
        talle: 2,
        talle_detalle: "39 AR",
        color: 1,
        color_nombre: "Negro",
        stock: 50,
        precio_ajustado: null,
        precio_final: "249999.00",
        activo: true,
      },
      {
        id: 54,
        sku: "VX-VSR-38-BLA",
        producto: 7,
        producto_nombre: "Velox Street Run",
        talle: 1,
        talle_detalle: "38 AR",
        color: 2,
        color_nombre: "Blanco",
        stock: 25,
        precio_ajustado: null,
        precio_final: "99999.00",
        activo: true,
      },
    ],
  };

  it("actualiza dinámicamente 'STOCK EN DEPÓSITO' y 'VARIANTES SKU ACTIVAS' con datos reales de DRF", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantes);

    render(<DashboardPage />);

    // Esperar a que carguen las variantes de DRF (stock total: 50 + 25 = 75, activas: 2)
    await waitFor(() => {
      expect(screen.getByText("75 u.")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("actualiza el KPI de stock inmediatamente cuando se hace PATCH a una variante", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantes);
    vi.spyOn(api, "patch").mockResolvedValueOnce({
      ...mockVariantes.results[0],
      stock: 100,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("75 u.")).toBeInTheDocument();
    });

    // Abrir modal de edición para la primera variante
    const botonesAjustar = screen.getAllByRole("button", { name: /AJUSTAR \(PATCH\)/i });
    fireEvent.click(botonesAjustar[0]);

    // Modificar stock a 100
    const inputStock = screen.getByLabelText(/Stock Físico en Depósito/i);
    fireEvent.change(inputStock, { target: { value: "100" } });

    // Guardar
    const btnGuardar = screen.getByRole("button", { name: /GUARDAR CAMBIOS \(PATCH\)/i });
    fireEvent.click(btnGuardar);

    // Nuevo stock total: 100 + 25 = 125 u.
    await waitFor(() => {
      expect(screen.getByText("125 u.")).toBeInTheDocument();
    });
  });

  it("actualiza los KPIs inmediatamente cuando se crea una nueva variante (POST)", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantes);
    vi.spyOn(api, "post").mockResolvedValueOnce({
      id: 99,
      sku: "VX-KAS-40-NEO",
      producto: 6,
      producto_nombre: "Velox Carbon X",
      talle: 3,
      talle_detalle: "40 AR",
      color: 3,
      color_nombre: "Verde Neón",
      stock: 30,
      precio_ajustado: null,
      precio_final: "249999.00",
      activo: true,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("75 u.")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    // Abrir modal de creación
    const btnNuevaVariante = screen.getByRole("button", {
      name: /\+ NUEVA VARIANTE SKU \(POST\)/i,
    });
    fireEvent.click(btnNuevaVariante);

    // Ingresar SKU y stock
    const inputSku = screen.getByPlaceholderText(/ej\. VX-VCX-41-NEO/i);
    fireEvent.change(inputSku, { target: { value: "VX-KAS-40-NEO" } });

    const btnCrear = screen.getByRole("button", { name: /CREAR VARIANTE EN DRF/i });
    fireEvent.click(btnCrear);

    // Nuevo stock total: 75 + 30 = 105 u. y 3 variantes activas
    await waitFor(() => {
      expect(screen.getByText("105 u.")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("actualiza los KPIs inmediatamente cuando se elimina una variante (DELETE)", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantes);
    vi.spyOn(api, "delete").mockResolvedValueOnce(null);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("75 u.")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    // Eliminar la segunda variante (stock: 25)
    const botonesEliminar = screen.getAllByRole("button", { name: /ELIMINAR \(DELETE\)/i });
    fireEvent.click(botonesEliminar[1]);

    const btnConfirmarDelete = screen.getByRole("button", {
      name: /CONFIRMAR ELIMINACIÓN \(DELETE\)/i,
    });
    fireEvent.click(btnConfirmarDelete);

    // Nuevo stock total: 50 u. y 1 variante activa
    await waitFor(() => {
      const cardStock = screen.getByText("STOCK EN DEPÓSITO").closest("a");
      expect(within(cardStock).getByText("50 u.")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("excluye variantes inactivas del KPI de variantes activas pero computa su stock físico", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          ...mockVariantes.results[0],
          stock: 40,
          activo: true,
        },
        {
          ...mockVariantes.results[1],
          stock: 60,
          activo: false, // Inactiva para venta
        },
      ],
    });

    render(<DashboardPage />);

    // Stock total físico en depósito: 40 + 60 = 100 u., pero activas solo 1
    await waitFor(() => {
      const cardStock = screen.getByText("STOCK EN DEPÓSITO").closest("a");
      expect(within(cardStock).getByText("100 u.")).toBeInTheDocument();

      const cardActivas = screen.getByText("VARIANTES SKU ACTIVAS").closest("a");
      expect(within(cardActivas).getByText("1")).toBeInTheDocument();
    });
  });
});
