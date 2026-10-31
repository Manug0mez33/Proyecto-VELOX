import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardCrudManager from "../../components/DashboardCrudManager";
import { api } from "../../lib/api";

describe("DashboardCrudManager - Gestión de Inventario y Reseñas", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const mockVariantesResponse = {
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
        stock: 12,
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
        stock: 8,
        precio_ajustado: null,
        precio_final: "99999.00",
        activo: true,
      },
    ],
  };

  it("1. Carga y lista variantes de calzado", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
      expect(screen.getByText("VX-VSR-38-BLA")).toBeInTheDocument();
    });

    expect(screen.getByText("Velox Carbon X")).toBeInTheDocument();
    expect(screen.getByText("12 u.")).toBeInTheDocument();
  });

  it("2. Abre modal y ajusta el stock de una variante", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValueOnce({
      ...mockVariantesResponse.results[0],
      stock: 35,
    });

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    const botonesAjustar = screen.getAllByRole("button", { name: /EDITAR/i });
    fireEvent.click(botonesAjustar[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/EDITAR VARIANTE SKU/i)).toBeInTheDocument();

    const inputStock = screen.getByLabelText(/Stock en Depósito/i);
    fireEvent.change(inputStock, { target: { value: "35" } });

    const btnGuardar = screen.getByRole("button", { name: /GUARDAR CAMBIOS/i });
    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith(
        "/variantes/VX-VCX-39-NEG/",
        expect.objectContaining({ stock: 35 }),
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(screen.getByText("35 u.")).toBeInTheDocument();
      expect(screen.getByText(/actualizada con éxito/i)).toBeInTheDocument();
    });
  });

  it("3. Abre modal de alta y registra una nueva variante", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);
    const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({
      id: 99,
      sku: "VX-NEW-42-NEO",
      producto: 6,
      producto_nombre: "Velox Carbon X",
      talle: 5,
      talle_detalle: "42 AR",
      color: 3,
      color_nombre: "Verde Neón",
      stock: 20,
      precio_ajustado: "259999.00",
      precio_final: "259999.00",
      activo: true,
    });

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    const btnNuevaVariante = screen.getByRole("button", {
      name: /\+ NUEVA VARIANTE/i,
    });
    fireEvent.click(btnNuevaVariante);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/ALTA DE NUEVA VARIANTE SKU/i)).toBeInTheDocument();

    const inputSku = screen.getByPlaceholderText(/ej\. VX-VCX-41-NEO/i);
    fireEvent.change(inputSku, { target: { value: "VX-NEW-42-NEO" } });

    const btnCrear = screen.getByRole("button", { name: /CREAR VARIANTE/i });
    fireEvent.click(btnCrear);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        "/variantes/",
        expect.objectContaining({
          sku: "VX-NEW-42-NEO",
        }),
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(screen.getByText("VX-NEW-42-NEO")).toBeInTheDocument();
      expect(screen.getByText(/registrada exitosamente/i)).toBeInTheDocument();
    });
  });

  it("4. Abre modal de confirmación y elimina una variante", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);
    const deleteSpy = vi.spyOn(api, "delete").mockResolvedValueOnce(null);

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    const botonesEliminar = screen.getAllByRole("button", {
      name: /ELIMINAR/i,
    });
    fireEvent.click(botonesEliminar[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/ELIMINAR VARIANTE VX-VCX-39-NEG/i)).toBeInTheDocument();

    const btnConfirmarDelete = screen.getByRole("button", {
      name: /CONFIRMAR ELIMINACIÓN/i,
    });
    fireEvent.click(btnConfirmarDelete);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(
        "/variantes/VX-VCX-39-NEG/",
        expect.anything()
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("VX-VCX-39-NEG")).not.toBeInTheDocument();
      expect(screen.getByText(/eliminada correctamente/i)).toBeInTheDocument();
    });
  });
});
