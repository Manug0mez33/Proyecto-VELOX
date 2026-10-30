import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardCrudManager from "../../components/DashboardCrudManager";
import { api } from "../../lib/api";

describe("DashboardCrudManager (4 Operaciones CRUD - R3) - GET, POST, PATCH, DELETE", () => {
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

  it("1. READ (GET): Carga y lista variantes desde el sobre paginado de DRF", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
      expect(screen.getByText("VX-VSR-38-BLA")).toBeInTheDocument();
    });

    expect(screen.getByText("Velox Carbon X")).toBeInTheDocument();
    expect(screen.getByText("12 u.")).toBeInTheDocument();
  });

  it("2. UPDATE (PATCH): Abre modal y ajusta el stock físico de una variante", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValueOnce({
      ...mockVariantesResponse.results[0],
      stock: 35,
    });

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    // Click en botón AJUSTAR (PATCH) de la primera variante
    const botonesAjustar = screen.getAllByRole("button", { name: /AJUSTAR \(PATCH\)/i });
    fireEvent.click(botonesAjustar[0]);

    // Verificar modal abierto
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/AJUSTAR STOCK \/ PRECIO/i)).toBeInTheDocument();

    // Modificar stock
    const inputStock = screen.getByLabelText(/Stock Físico en Depósito/i);
    fireEvent.change(inputStock, { target: { value: "35" } });

    // Guardar cambios
    const btnGuardar = screen.getByRole("button", { name: /GUARDAR CAMBIOS \(PATCH\)/i });
    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith(
        "/variantes/VX-VCX-39-NEG/",
        expect.objectContaining({ stock: 35 }),
        expect.anything()
      );
    });

    // Comprobar actualización reactiva
    await waitFor(() => {
      expect(screen.getByText("35 u.")).toBeInTheDocument();
      expect(screen.getByText(/actualizada en DRF \(PATCH\)/i)).toBeInTheDocument();
    });
  });

  it("3. CREATE (POST): Abre modal de alta y envía nueva variante SKU a DRF", async () => {
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

    // Abrir modal de creación
    const btnNuevaVariante = screen.getByRole("button", {
      name: /\+ NUEVA VARIANTE SKU \(POST\)/i,
    });
    fireEvent.click(btnNuevaVariante);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/ALTA DE NUEVA VARIANTE SKU/i)).toBeInTheDocument();

    // Completar campo SKU
    const inputSku = screen.getByPlaceholderText(/ej\. VX-VCX-41-NEO/i);
    fireEvent.change(inputSku, { target: { value: "VX-NEW-42-NEO" } });

    // Enviar formulario
    const btnCrear = screen.getByRole("button", { name: /CREAR VARIANTE EN DRF/i });
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

    // Comprobar inserción en lista y mensaje de éxito
    await waitFor(() => {
      expect(screen.getByText("VX-NEW-42-NEO")).toBeInTheDocument();
      expect(screen.getByText(/registrada exitosamente en DRF \(POST\)/i)).toBeInTheDocument();
    });
  });

  it("4. DELETE (DELETE): Abre modal de confirmación y elimina una variante", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);
    const deleteSpy = vi.spyOn(api, "delete").mockResolvedValueOnce(null);

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    // Click en botón ELIMINAR (DELETE)
    const botonesEliminar = screen.getAllByRole("button", {
      name: /ELIMINAR \(DELETE\)/i,
    });
    fireEvent.click(botonesEliminar[0]);

    // Modal de confirmación
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/ELIMINAR VARIANTE VX-VCX-39-NEG/i)).toBeInTheDocument();

    // Confirmar eliminación
    const btnConfirmarDelete = screen.getByRole("button", {
      name: /CONFIRMAR ELIMINACIÓN \(DELETE\)/i,
    });
    fireEvent.click(btnConfirmarDelete);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(
        "/variantes/VX-VCX-39-NEG/",
        expect.anything()
      );
    });

    // La variante eliminada no debe estar presente
    await waitFor(() => {
      expect(screen.queryByText("VX-VCX-39-NEG")).not.toBeInTheDocument();
      expect(screen.getByText(/eliminada de la base de datos \(DELETE\)/i)).toBeInTheDocument();
    });
  });

  it("permite alternar entre la pestaña de Variantes y la de Reseñas", async () => {
    vi.spyOn(api, "getPaginated").mockImplementation(async (endpoint) => {
      if (endpoint === "/resenas/") {
        return { count: 0, next: null, previous: null, results: [] };
      }
      return mockVariantesResponse;
    });

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    // Cambiar a pestaña de Reseñas
    const tabResenas = screen.getByRole("button", { name: /RESEÑAS/i });
    fireEvent.click(tabResenas);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /\+ NUEVA RESEÑA \(POST\)/i })
      ).toBeInTheDocument();
    });
  });

  it("muestra feedback de error cuando UPDATE (PATCH) falla en DRF", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);
    vi.spyOn(api, "patch").mockRejectedValueOnce(
      new Error("Las credenciales de autenticación no se proveyeron.")
    );

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    const botonesAjustar = screen.getAllByRole("button", { name: /AJUSTAR \(PATCH\)/i });
    fireEvent.click(botonesAjustar[0]);

    const btnGuardar = screen.getByRole("button", { name: /GUARDAR CAMBIOS \(PATCH\)/i });
    fireEvent.click(btnGuardar);

    await waitFor(() => {
      expect(
        screen.getByText(/Las credenciales de autenticación no se proveyeron./i)
      ).toBeInTheDocument();
    });
  });

  it("muestra feedback de error cuando CREATE (POST) falla en DRF por SKU duplicado", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);
    vi.spyOn(api, "post").mockRejectedValueOnce(
      new Error("sku: Ya existe un/a variante de producto con este/a sku.")
    );

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    const btnNuevaVariante = screen.getByRole("button", {
      name: /\+ NUEVA VARIANTE SKU \(POST\)/i,
    });
    fireEvent.click(btnNuevaVariante);

    const inputSku = screen.getByPlaceholderText(/ej\. VX-VCX-41-NEO/i);
    fireEvent.change(inputSku, { target: { value: "VX-VCX-39-NEG" } });

    const btnCrear = screen.getByRole("button", { name: /CREAR VARIANTE EN DRF/i });
    fireEvent.click(btnCrear);

    await waitFor(() => {
      expect(
        screen.getByText(/Ya existe un\/a variante de producto con este\/a sku/i)
      ).toBeInTheDocument();
    });
  });

  it("muestra feedback de error cuando DELETE falla en DRF por integridad referencial", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce(mockVariantesResponse);
    vi.spyOn(api, "delete").mockRejectedValueOnce(
      new Error("No se puede eliminar la variante porque está asociada a pedidos existentes.")
    );

    render(<DashboardCrudManager />);

    await waitFor(() => {
      expect(screen.getByText("VX-VCX-39-NEG")).toBeInTheDocument();
    });

    const botonesEliminar = screen.getAllByRole("button", { name: /ELIMINAR \(DELETE\)/i });
    fireEvent.click(botonesEliminar[0]);

    const btnConfirmarDelete = screen.getByRole("button", {
      name: /CONFIRMAR ELIMINACIÓN \(DELETE\)/i,
    });
    fireEvent.click(btnConfirmarDelete);

    await waitFor(() => {
      expect(
        screen.getByText(/No se puede eliminar la variante porque está asociada a pedidos existentes/i)
      ).toBeInTheDocument();
    });
  });
});
