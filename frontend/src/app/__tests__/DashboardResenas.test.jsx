import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardCrudManager from "../../components/DashboardCrudManager";
import { api } from "../../lib/api";

// JWT de prueba con el rol indicado (la firma no se valida en el frontend).
const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, "");
const tokenCon = (rol) => `${b64({ alg: "HS256" })}.${b64({ user_id: "9", rol })}.firma`;

const resenasApi = {
  count: 3,
  results: [1, 2, 3].map((id) => ({
    id,
    usuario: 20 + id,
    usuario_nombre: `cliente${id}`,
    producto: 1,
    producto_nombre: "Air Zoom Pegasus 40",
    calificacion: 5,
    comentario: `Opinión ${id}`,
    creado_en: "2026-10-31T10:00:00-03:00",
  })),
};

// Responde según el endpoint: variantes vacías y 3 reseñas reales.
const mockApi = () =>
  vi.spyOn(api, "getPaginated").mockImplementation((endpoint) =>
    Promise.resolve(endpoint.startsWith("/resenas") ? resenasApi : { count: 0, results: [] })
  );

describe("DashboardCrudManager - solapa de reseñas", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("muestra el número real de reseñas sin tener que abrir la solapa", async () => {
    mockApi();
    render(<DashboardCrudManager />);

    // Antes mostraba "(2)" de los datos de ejemplo hasta hacer click en la solapa.
    expect(await screen.findByText("★ RESEÑAS (3)")).toBeInTheDocument();
    expect(screen.queryByText("★ RESEÑAS (2)")).not.toBeInTheDocument();
  });

  it("un EMPLEADO no ve '+ NUEVA RESEÑA' pero sí puede editar y eliminar", async () => {
    localStorage.setItem("velox_access_token", tokenCon("EMPLEADO"));
    mockApi();
    render(<DashboardCrudManager />);

    fireEvent.click(await screen.findByText("★ RESEÑAS (3)"));
    await waitFor(() => expect(screen.getByText(/Opinión 1/)).toBeInTheDocument());
    expect(screen.queryByText("+ NUEVA RESEÑA")).not.toBeInTheDocument();
    expect(screen.getAllByText("EDITAR").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ELIMINAR").length).toBeGreaterThan(0);
  });

  it("un ADMIN sí puede publicar reseñas", async () => {
    localStorage.setItem("velox_access_token", tokenCon("ADMIN"));
    mockApi();
    render(<DashboardCrudManager />);

    fireEvent.click(await screen.findByText("★ RESEÑAS (3)"));
    expect(await screen.findByText("+ NUEVA RESEÑA")).toBeInTheDocument();
  });
});
