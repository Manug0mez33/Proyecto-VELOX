"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../validations/authSchema";
import { api, ApiError, formatDrfError } from "../../lib/api";
import { loginAction } from "../actions";
import Button from "../../components/Button";
import Badge from "../../components/Badge";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      telefono: "",
      direccion: "",
      ciudad: "",
    },
  });

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.first_name ? formData.first_name.trim() : "",
        last_name: formData.last_name ? formData.last_name.trim() : "",
        telefono: formData.telefono ? formData.telefono.trim() : "",
        direccion: formData.direccion ? formData.direccion.trim() : "",
        ciudad: formData.ciudad ? formData.ciudad.trim() : "",
      };

      // 1. Alta del nuevo usuario en el backend
      await api.post("/usuarios/", payload);

      setRegisterSuccess(true);

      // 2. Autenticación automática inmediata
      const loginResult = await loginAction({
        username: payload.username,
        password: payload.password,
      });

      if (loginResult && loginResult.success) {
        if (typeof window !== "undefined" && loginResult.access) {
          localStorage.setItem("velox_access_token", loginResult.access);
          if (loginResult.refresh) {
            localStorage.setItem("velox_refresh_token", loginResult.refresh);
          }
          localStorage.setItem("velox_username", loginResult.username || payload.username);
          window.dispatchEvent(new Event("velox-auth-changed"));
        }
      }

      // 3. Redirección al panel o tienda
      setTimeout(() => {
        router.push("/productos");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error("Error en registro:", err);
      if (err instanceof ApiError && err.data) {
        setServerError(formatDrfError(err.data));
      } else {
        setServerError(
          err.message || "No se pudo completar el registro. Por favor verificá los datos ingresados."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1440px] items-center justify-center px-6 lg:px-20 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] p-8 shadow-2xl space-y-6">
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <Badge variant="outline">NUEVA CUENTA</Badge>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FFFFFF]">
            REGISTRARME EN VELOX
          </h1>
          <p className="text-xs text-[#9CA3AF]">
            Creá tu cuenta de atleta para realizar pedidos y acceder a lanzamientos exclusivos.
          </p>
        </div>

        {/* Mensaje de Éxito */}
        {registerSuccess && (
          <div className="rounded-lg bg-[#182914] border border-[#39FF14] p-4 text-xs text-[#39FF14] animate-pulse">
            ✓ ¡Cuenta creada con éxito! Iniciando sesión y accediendo a la tienda...
          </div>
        )}

        {/* Error */}
        {serverError && (
          <div className="rounded-lg bg-[#2A1515] border border-[#EF4444] p-4 text-xs text-[#F87171] leading-relaxed">
            {serverError}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Nombre de usuario y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="username"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
              >
                Usuario *
              </label>
              <input
                id="username"
                type="text"
                placeholder="ej. corredorpuro"
                {...register("username")}
                className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                  errors.username
                    ? "border-[#EF4444] focus:ring-[#EF4444]"
                    : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-[#EF4444]">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="ej. atleta@velox.com.ar"
                {...register("email")}
                className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                  errors.email
                    ? "border-[#EF4444] focus:ring-[#EF4444]"
                    : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#EF4444]">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
              >
                Nombre
              </label>
              <input
                id="first_name"
                type="text"
                placeholder="ej. Manuel"
                {...register("first_name")}
                className="w-full rounded-lg bg-[#121212] border border-[#2A2A2A] px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
              />
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
              >
                Apellido
              </label>
              <input
                id="last_name"
                type="text"
                placeholder="ej. Gómez"
                {...register("last_name")}
                className="w-full rounded-lg bg-[#121212] border border-[#2A2A2A] px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
              />
            </div>
          </div>

          {/* Contraseña y Confirmar Contraseña */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
              >
                Contraseña *
              </label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...register("password")}
                className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                  errors.password
                    ? "border-[#EF4444] focus:ring-[#EF4444]"
                    : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[#EF4444]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
              >
                Confirmar Contraseña *
              </label>
              <input
                id="confirm_password"
                type="password"
                placeholder="Repetir contraseña"
                {...register("confirm_password")}
                className={`w-full rounded-lg bg-[#121212] border px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                  errors.confirm_password
                    ? "border-[#EF4444] focus:ring-[#EF4444]"
                    : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
                }`}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-xs text-[#EF4444]">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </div>

          {/* Ciudad y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ciudad"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
              >
                Ciudad
              </label>
              <input
                id="ciudad"
                type="text"
                placeholder="ej. Río Cuarto"
                {...register("ciudad")}
                className="w-full rounded-lg bg-[#121212] border border-[#2A2A2A] px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
              />
            </div>

            <div>
              <label
                htmlFor="telefono"
                className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
              >
                Teléfono
              </label>
              <input
                id="telefono"
                type="tel"
                placeholder="ej. 3584123456"
                {...register("telefono")}
                className="w-full rounded-lg bg-[#121212] border border-[#2A2A2A] px-3.5 py-2.5 text-sm text-[#FFFFFF] placeholder-[#6B7280] focus:border-[#39FF14] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
              />
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-3.5 text-xs font-bold"
            >
              {isSubmitting ? "REGISTRANDO CUENTA..." : "CREAR MI CUENTA VELOX →"}
            </Button>
          </div>
        </form>

        {/* Link hacia Login */}
        <div className="text-center pt-2 border-t border-[#2A2A2A] space-y-2">
          <p className="text-xs text-[#9CA3AF]">
            ¿Ya tenés una cuenta creada?{" "}
            <Link
              href="/login"
              className="text-[#39FF14] font-bold hover:underline"
            >
              Iniciá sesión acá
            </Link>
          </p>
          <div>
            <Link
              href="/"
              className="text-xs text-[#6B7280] hover:text-[#FFFFFF] transition-colors"
            >
              ← Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
