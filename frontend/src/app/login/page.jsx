"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validations/authSchema";
import { loginAction } from "../actions";
import Button from "../../components/Button";
import Badge from "../../components/Badge";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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
      const result = await loginAction(data);

      if (!result.success) {
        setServerError(result.error || "Credenciales inválidas. Verificá tu usuario y contraseña.");
        return;
      }

      if (typeof window !== "undefined" && result.access) {
        localStorage.setItem("velox_access_token", result.access);
        if (result.refresh) {
          localStorage.setItem("velox_refresh_token", result.refresh);
        }
        localStorage.setItem("velox_username", result.username || data.username);
        window.dispatchEvent(new Event("velox-auth-changed"));
      }

      setLoginSuccess(true);

      // Sin destino explícito: el personal va al dashboard y los clientes al catálogo.
      const destino = redirectParam || (result.es_personal_tienda ? "/dashboard" : "/productos");

      setTimeout(() => {
        router.push(destino);
        router.refresh();
      }, 600);
    } catch (err) {
      console.error("Error en flujo de login:", err);
      setServerError(
        "No se pudo conectar con el servidor. Por favor, intentá nuevamente en unos momentos."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillCredentials = (user, pass) => {
    setValue("username", user, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-[#1E1E1E] border border-[#2A2A2A] p-8 shadow-2xl space-y-6">
      {/* Cabecera del formulario */}
      <div className="text-center space-y-2">
        <Badge variant="outline">MI CUENTA</Badge>
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold uppercase text-[#FFFFFF]">
          ACCESO VELOX
        </h1>
        <p className="text-xs text-[#9CA3AF]">
          Iniciá sesión para gestionar tus pedidos y acceder a tu perfil.
        </p>
      </div>

      {/* Notificación de Éxito o Error de Servidor */}
      {loginSuccess && (
        <div className="rounded-lg bg-[#182914] border border-[#39FF14] p-4 text-xs text-[#39FF14] animate-pulse">
          ✓ ¡Sesión iniciada con éxito! Redirigiendo...
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
            Nombre de Usuario
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="ej. cliente1 o admin"
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
            {isSubmitting ? "INICIANDO SESIÓN..." : "INGRESAR A VELOX →"}
          </Button>
        </div>
      </form>

      {/* Acceso Rápido de Prueba */}
      <div className="rounded-xl bg-[#141414] border border-[#2A2A2A] p-4 text-[11px] text-[#9CA3AF] space-y-2">
        <p className="font-heading font-bold uppercase text-[#FFFFFF]">
          ACCESO RÁPIDO:
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => handleFillCredentials("cliente1", "cliente1234")}
            className="text-left hover:text-[#39FF14] transition-colors group flex items-center justify-between"
          >
            <span>
              <strong className="text-[#39FF14]">Cliente:</strong> usuario: <code className="text-white">cliente1</code> | clave: <code className="text-white">cliente1234</code>
            </span>
            <span className="text-[10px] uppercase text-[#6B7280] group-hover:text-[#39FF14]">Cargar ↵</span>
          </button>
          <button
            type="button"
            onClick={() => handleFillCredentials("admin", "admin1234")}
            className="text-left hover:text-[#39FF14] transition-colors group flex items-center justify-between"
          >
            <span>
              <strong className="text-[#D1D5DB]">Admin:</strong> usuario: <code className="text-white">admin</code> | clave: <code className="text-white">admin1234</code>
            </span>
            <span className="text-[10px] uppercase text-[#6B7280] group-hover:text-[#39FF14]">Cargar ↵</span>
          </button>
        </div>
      </div>

      {/* Enlace hacia el Registro */}
      <div className="text-center pt-2 border-t border-[#2A2A2A] space-y-2">
        <p className="text-xs text-[#9CA3AF]">
          ¿No tenés una cuenta todavía?{" "}
          <Link
            href="/register"
            className="text-[#39FF14] font-bold hover:underline"
          >
            Registrate acá
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
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[1440px] items-center justify-center px-6 lg:px-20 py-12">
      <Suspense fallback={<div className="text-xs text-[#9CA3AF]">Cargando acceso...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
