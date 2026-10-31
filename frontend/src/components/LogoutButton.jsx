"use client";
// Client Component ("use client"): Botón interactivo de cierre de sesión que invoca la Server Action logoutAction() para eliminar las Cookies HTTP-Only y limpia localStorage.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "../app/actions";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // 1. Invocar Server Action para borrar Cookies HTTP-Only (R4)
      await logoutAction();

      // 2. Limpieza de almacenamiento local para componentes cliente
      if (typeof window !== "undefined") {
        localStorage.removeItem("velox_access_token");
        localStorage.removeItem("velox_refresh_token");
        localStorage.removeItem("velox_username");
        window.dispatchEvent(new Event("velox-auth-changed"));
      }

      // 3. Redirección limpia al login
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Fallback de navegación
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex w-full items-center justify-center rounded-lg bg-[#2A1515] border border-[#EF4444]/40 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F87171] transition-colors hover:bg-[#3D1A1A] hover:border-[#EF4444] disabled:opacity-50"
    >
      {isLoggingOut ? "CERRANDO SESIÓN..." : "CERRAR SESIÓN"}
    </button>
  );
}
