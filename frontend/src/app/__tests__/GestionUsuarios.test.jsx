import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GestionUsuariosPage from "../dashboard/usuarios/page";
import { api } from "../../lib/api";
import { usuarioAdminSchema } from "../../validations/usuarioSchema";

// JWT de prueba del administrador logueado (user_id 1).
const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, "");
const TOKEN_ADMIN = `${b64({ alg: "HS256" })}.${b64({ user_id: "1", es_administrador: true })}.firma`;

const USUARIOS = [
  { id: 1, username: "admin", email: "admin@velox.com", first_name: "", last_name: "", rol: "ADMIN" },
  { id: 2, username: "jperez", email: "jperez@velox.com", first_name: "Juan", last_name: "Pérez", rol: "CLIENTE" },
];

describe("usuarioAdminSchema", () => {
  it("rechaza roles inexistentes y contraseñas cortas", () => {
    const res = usuarioAdminSchema.safeParse({ username: "abc", email: "a@b.com", password: "123", rol: "JEFE" });
    expect(res.success).toBe(false);
    const campos = res.error.issues.map((i) => i.path[0]);
    expect(campos).toEqual(expect.arrayContaining(["password", "rol"]));
  });
});

describe("Gestión de usuarios (/dashboard/usuarios)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    localStorage.setItem("velox_access_token", TOKEN_ADMIN);
  });

  it("lista los usuarios y no deja que el admin cambie su propio rol", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce({ count: 2, results: USUARIOS });
    render(<GestionUsuariosPage />);

    expect(await screen.findByText("jperez")).toBeInTheDocument();
    expect(screen.getByLabelText("Rol de admin")).toBeDisabled();
    expect(screen.getByLabelText("Rol de jperez")).not.toBeDisabled();
  });

  it("crea un usuario enviando el rol elegido", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValue({ count: 2, results: USUARIOS });
    const postSpy = vi.spyOn(api, "post").mockResolvedValueOnce({ id: 3 });
    render(<GestionUsuariosPage />);
    await screen.findByText("jperez");

    fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "mgomez" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "mgomez@velox.com" } });
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "Clave-Segura-1" } });
    fireEvent.change(screen.getByLabelText("Rol"), { target: { value: "EMPLEADO" } });
    fireEvent.click(screen.getByText("+ CREAR USUARIO"));

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(
        "/usuarios/",
        expect.objectContaining({ username: "mgomez", rol: "EMPLEADO" }),
        { token: TOKEN_ADMIN }
      );
      expect(screen.getByText(/Usuario "mgomez" creado con rol EMPLEADO/)).toBeInTheDocument();
    });
  });

  it("cambia el rol de otro usuario con PATCH", async () => {
    vi.spyOn(api, "getPaginated").mockResolvedValueOnce({ count: 2, results: USUARIOS });
    const patchSpy = vi.spyOn(api, "patch").mockResolvedValueOnce({ ...USUARIOS[1], rol: "EMPLEADO" });
    render(<GestionUsuariosPage />);

    fireEvent.change(await screen.findByLabelText("Rol de jperez"), { target: { value: "EMPLEADO" } });

    await waitFor(() => {
      expect(patchSpy).toHaveBeenCalledWith("/usuarios/2/", { rol: "EMPLEADO" }, { token: TOKEN_ADMIN });
      expect(screen.getByLabelText("Rol de jperez")).toHaveValue("EMPLEADO");
    });
  });
});
