"use client";
// Client Component ("use client"): Formulario interactivo de inicio de sesión con React Hook Form + Zod (loginSchema) que valida credenciales y gestiona estados de carga y error.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validations/authSchema";
import { api, ApiError } from "../../lib/api";
import Button from "../../components/Button";
import Badge from "../../components/Badge";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      // Envío de credenciales a endpoint POST /api/token/ mediante cliente HTTP unificado (R3)
      const res = await api.post("/token/", data);
      
      // Almacenamiento seguro de tokens JWT en localStorage
      if (res?.access) {
        localStorage.setItem("velox_access_token", res.access);
        if (res.refresh) {
          localStorage.setItem("velox_refresh_token", res.refresh);
        }
        localStorage.setItem("velox_username", data.username);
        window.dispatchEvent(new Event("velox-auth-changed"));
      }

      setLoginSuccess(true);

      // Redirección reactiva al dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message || "Credenciales inválidas. Verifica tu usuario y contraseña.");
      } else {
        setServerError(
          "Aviso de desarrollo: No se pudo conectar con el backend de Django REST Framework. Verifica que el servicio esté corriendo en el servidor configurado."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1440px] items-center justify-center px-6 lg:px-20 py-12">
      <div className="w-full max-w-md rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] p-8 shadow-2xl space-y-6">
        {/* Cabecera del formulario */}
        <div className="text-center space-y-2">
          <Badge variant="neon">AUTENTICACIÓN R4</Badge>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FFFFFF]">
            ACCESO VELOX
          </h1>
          <p className="text-xs text-[#9CA3AF]">
            Inicia sesión para gestionar pedidos, catálogo y telemetría deportiva.
          </p>
        </div>

        {/* Notificación de Éxito o Error de Servidor */}
        {loginSuccess && (
          <div className="rounded-lg bg-[#182914] border border-[#39FF14] p-4 text-xs text-[#39FF14]">
            ✓ ¡Sesión validada exitosamente con el backend! Redirigiendo...
          </div>
        )}

        {serverError && (
          <div className="rounded-lg bg-[#2A1515] border border-[#EF4444] p-4 text-xs text-[#F87171] leading-relaxed">
            {serverError}
          </div>
        )}

        {/* Formulario con React Hook Form + Zod */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="username"
              className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
            >
              Nombre de Usuario (snake_case DRF)
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="ej. tomas_benavidez"
              {...register("username")}
              className={`w-full rounded-lg bg-[#121212] border px-4 py-3 text-sm text-[#FFFFFF] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                errors.username
                  ? "border-[#EF4444] focus:ring-[#EF4444]"
                  : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
              }`}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs text-[#EF4444] font-medium">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-heading text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-lg bg-[#121212] border px-4 py-3 text-sm text-[#FFFFFF] placeholder-[#6B7280] transition-colors focus:outline-none focus:ring-1 ${
                errors.password
                  ? "border-[#EF4444] focus:ring-[#EF4444]"
                  : "border-[#2A2A2A] focus:border-[#39FF14] focus:ring-[#39FF14]"
              }`}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-[#EF4444] font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-3.5 text-xs"
            >
              {isSubmitting ? "AUTENTICANDO CON DRF..." : "ACCEDER A VELOX →"}
            </Button>
          </div>
        </form>

        {/* Credenciales de Prueba para Defensa Oral */}
        <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 text-[11px] text-[#9CA3AF] space-y-1">
          <p className="font-heading font-bold uppercase text-[#FFFFFF]">
            CREDENCIALES DE PRUEBA (EFI 2026):
          </p>
          <p>
            <strong className="text-[#39FF14]">Admin:</strong> usuario: <code className="text-white">admin</code> | clave: <code className="text-white">admin1234</code>
          </p>
          <p>
            <strong className="text-[#D1D5DB]">Cliente:</strong> usuario: <code className="text-white">cliente1</code> | clave: <code className="text-white">cliente1234</code>
          </p>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-[#9CA3AF] hover:text-[#39FF14] transition-colors"
          >
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}
