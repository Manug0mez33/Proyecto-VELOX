"use client";
// Client Component ("use client"): formulario con React Hook Form + Zod para dar de alta usuarios y selects onChange para cambiar roles, usando el JWT del ADMIN guardado en localStorage.

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../../lib/api";
import { parseJwt } from "../../../lib/jwt";
import { ROLES_USUARIO, usuarioAdminSchema } from "../../../validations/usuarioSchema";
import Badge from "../../../components/Badge";
import Button from "../../../components/Button";

const VALORES_INICIALES = { username: "", email: "", password: "", first_name: "", last_name: "", rol: "CLIENTE" };

const CAMPOS_ALTA = [
  { name: "username", label: "Usuario", type: "text", placeholder: "ej. jperez" },
  { name: "email", label: "Email", type: "email", placeholder: "ej. jperez@velox.com" },
  { name: "password", label: "Contraseña", type: "password", placeholder: "Mínimo 8 caracteres" },
  { name: "first_name", label: "Nombre", type: "text", placeholder: "Opcional" },
  { name: "last_name", label: "Apellido", type: "text", placeholder: "Opcional" },
];

const inputClass =
  "w-full h-10 rounded-md bg-[#121212] border border-[#3F3F3F] px-3 text-xs text-[#FFFFFF] placeholder-[#666666] focus:outline-none focus:border-[#39FF14]";

export default function GestionUsuariosPage() {
  const [token, setToken] = useState(null);
  const [miId, setMiId] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(usuarioAdminSchema), defaultValues: VALORES_INICIALES });

  const cargarUsuarios = useCallback(async (tokenActual) => {
    setCargando(true);
    try {
      const data = await api.getPaginated("/usuarios/", {
        token: tokenActual,
        params: { page_size: 100, ordering: "username" },
      });
      setUsuarios(data.results);
    } catch (err) {
      setFeedback({ tipo: "error", texto: err.message || "No se pudieron cargar los usuarios." });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem("velox_access_token");
    } catch {
      // Navegador sin localStorage disponible
    }
    setToken(stored);
    setMiId(parseJwt(stored)?.user_id ?? null);
    if (stored) cargarUsuarios(stored);
    else setCargando(false);
  }, [cargarUsuarios]);

  const onCrearUsuario = async (datos) => {
    setFeedback(null);
    try {
      // El backend solo respeta "rol" si quien crea la cuenta es ADMIN (RegistroUsuarioSerializer.validate_rol).
      await api.post("/usuarios/", datos, { token });
      setFeedback({ tipo: "ok", texto: `✓ Usuario "${datos.username}" creado con rol ${datos.rol}.` });
      reset(VALORES_INICIALES);
      cargarUsuarios(token);
    } catch (err) {
      setFeedback({ tipo: "error", texto: err.message || "No se pudo crear el usuario." });
    }
  };

  const handleCambiarRol = async (usuario, rol) => {
    setFeedback(null);
    try {
      const actualizado = await api.patch(`/usuarios/${usuario.id}/`, { rol }, { token });
      setUsuarios((prev) => prev.map((u) => (u.id === usuario.id ? { ...u, rol: actualizado.rol } : u)));
      setFeedback({ tipo: "ok", texto: `✓ ${usuario.username} ahora tiene rol ${actualizado.rol}.` });
    } catch (err) {
      setFeedback({ tipo: "error", texto: err.message || "No se pudo cambiar el rol." });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="outline">ADMINISTRACIÓN DE ACCESOS</Badge>
        <h2 className="font-heading text-2xl font-extrabold uppercase text-[#FFFFFF]">
          GESTIÓN DE USUARIOS
        </h2>
        <p className="text-xs text-[#D1D5DB]">
          Alta de cuentas y asignación de roles: ADMIN y EMPLEADO acceden al panel; CLIENTE compra y sigue sus pedidos.
        </p>
      </div>

      {feedback && (
        <div
          role={feedback.tipo === "error" ? "alert" : "status"}
          className={`rounded-lg p-3 text-xs ${
            feedback.tipo === "error"
              ? "bg-[#2A1515] border border-[#EF4444] text-[#FCA5A5]"
              : "bg-[#1D2B1A] border border-[#39FF14] text-[#39FF14]"
          }`}
        >
          {feedback.texto}
        </div>
      )}

      {/* Alta de usuario */}
      <form
        onSubmit={handleSubmit(onCrearUsuario)}
        className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-5 space-y-4"
        noValidate
      >
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[#FFFFFF]">
          NUEVO USUARIO
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CAMPOS_ALTA.map((campo) => (
            <div key={campo.name}>
              <label htmlFor={`nuevo-${campo.name}`} className="block text-[11px] font-bold uppercase text-[#D1D5DB] mb-1">
                {campo.label}
              </label>
              <input
                id={`nuevo-${campo.name}`}
                type={campo.type}
                placeholder={campo.placeholder}
                autoComplete={campo.type === "password" ? "new-password" : "off"}
                {...register(campo.name)}
                className={inputClass}
              />
              {errors[campo.name] && (
                <p className="mt-1 text-[11px] text-[#F87171]">{errors[campo.name].message}</p>
              )}
            </div>
          ))}
          <div>
            <label htmlFor="nuevo-rol" className="block text-[11px] font-bold uppercase text-[#D1D5DB] mb-1">
              Rol
            </label>
            <select id="nuevo-rol" {...register("rol")} className={inputClass}>
              {ROLES_USUARIO.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.rol && <p className="mt-1 text-[11px] text-[#F87171]">{errors.rol.message}</p>}
          </div>
        </div>
        <Button type="submit" variant="primary" disabled={isSubmitting} className="text-xs py-2.5">
          {isSubmitting ? "CREANDO..." : "+ CREAR USUARIO"}
        </Button>
      </form>

      {/* Listado y cambio de rol */}
      <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#181818] text-[11px] uppercase tracking-wider text-[#9CA3AF]">
            <tr>
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A] text-[#D1D5DB]">
            {cargando && (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-[#9CA3AF]">Cargando usuarios...</td>
              </tr>
            )}
            {usuarios.map((u) => {
              // Un admin no puede cambiarse su propio rol (evita quedarse sin acceso al panel).
              const esYo = String(u.id) === String(miId);
              return (
                <tr key={u.id}>
                  <td className="py-3 px-4 font-heading font-bold text-[#FFFFFF]">
                    {u.username}
                    {esYo && <span className="text-[#39FF14]"> (vos)</span>}
                  </td>
                  <td className="py-3 px-4">{[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.rol}
                      disabled={esYo}
                      onChange={(e) => handleCambiarRol(u, e.target.value)}
                      aria-label={`Rol de ${u.username}`}
                      className="h-8 rounded-md bg-[#121212] border border-[#3F3F3F] px-2 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#39FF14] disabled:opacity-50"
                    >
                      {ROLES_USUARIO.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
