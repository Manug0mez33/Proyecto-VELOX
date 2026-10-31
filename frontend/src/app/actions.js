"use server";
// Server Actions ("use server"): Funciones del servidor para autenticación JWT (R4) con almacenamiento seguro en Cookies HTTP-Only y revalidación de caché en Next.js App Router.

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { loginSchema } from "../validations/authSchema";
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, USER_COOKIE_NAME } from "../lib/auth";
import { esPersonalTienda } from "../lib/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Server Action para iniciar sesión contra Django REST Framework (SimpleJWT).
 * Valida los datos con Zod (loginSchema en snake_case) y almacena los tokens en Cookies HTTP-Only.
 * 
 * @param {object|FormData} payload - Objeto { username, password } o instancia de FormData
 * @returns {Promise<{ success: boolean, access?: string, refresh?: string, username?: string, es_personal_tienda?: boolean, error?: string }>}
 */
export async function loginAction(payload) {
  try {
    // Normalizar entrada ya sea FormData o plano
    let rawData = {};
    if (payload instanceof FormData) {
      rawData = {
        username: payload.get("username") || "",
        password: payload.get("password") || "",
      };
    } else if (typeof payload === "object" && payload !== null) {
      rawData = payload;
    }

    // Validación estricta en servidor con Zod (R5)
    const validationResult = loginSchema.safeParse(rawData);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Datos de acceso inválidos.";
      return { success: false, error: firstError };
    }

    const { username, password } = validationResult.data;

    // Consumo del endpoint nativo de SimpleJWT en Django
    const res = await fetch(`${API_BASE_URL}/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        return {
          success: false,
          error: "No existe una cuenta activa con las credenciales ingresadas.",
        };
      }
      return {
        success: false,
        error: data.detail || data.non_field_errors?.[0] || "Error de autenticación con el servidor.",
      };
    }

    if (!data.access) {
      return {
        success: false,
        error: "El servidor de autenticación no retornó el token de acceso requerido.",
      };
    }

    // Almacenamiento seguro en Cookies HTTP-Only (R4)
    // El flag httpOnly: true impide que scripts maliciosos (XSS) lean el JWT en el cliente
    const cookieStore = await cookies();

    // Cookie de acceso (1 día)
    cookieStore.set(AUTH_COOKIE_NAME, data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 horas
    });

    // Cookie de refresco (7 días)
    if (data.refresh) {
      cookieStore.set(REFRESH_COOKIE_NAME, data.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 días
      });
    }

    // Cookie de usuario accesible para interfaz
    cookieStore.set(USER_COOKIE_NAME, username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return {
      success: true,
      access: data.access,
      refresh: data.refresh,
      username,
      // Define a dónde se redirige tras el login (dashboard solo para ADMIN/EMPLEADO).
      es_personal_tienda: esPersonalTienda(data.access),
    };
  } catch (error) {
    console.error("Error en Server Action loginAction:", error);
    return {
      success: false,
      error:
        "No se pudo establecer conexión con el backend de Django REST Framework. Verifica que el servidor esté activo.",
    };
  }
}

/**
 * Server Action para cerrar sesión.
 * Elimina las Cookies HTTP-Only asociadas a la sesión.
 * 
 * @returns {Promise<{ success: boolean }>}
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    cookieStore.delete(REFRESH_COOKIE_NAME);
    cookieStore.delete(USER_COOKIE_NAME);

    // Revalidar rutas protegidas
    revalidatePath("/dashboard");
    revalidatePath("/productos");

    return { success: true };
  } catch (error) {
    console.error("Error en Server Action logoutAction:", error);
    return { success: false, error: "Error al cerrar sesión." };
  }
}

/**
 * Server Action para consultar el estado de sesión actual desde las Cookies del servidor.
 * 
 * @returns {Promise<{ isAuthenticated: boolean, username: string|null }>}
 */
export async function getAuthSessionAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const username = cookieStore.get(USER_COOKIE_NAME)?.value;

    return {
      isAuthenticated: Boolean(token),
      username: username || null,
    };
  } catch {
    return {
      isAuthenticated: false,
      username: null,
    };
  }
}

/**
 * Revalida la caché de Next.js para rutas de productos tras mutaciones CRUD (R3).
 */
export async function revalidateProductsAction() {
  revalidatePath("/productos");
  revalidatePath("/dashboard");
  return { revalidated: true, now: Date.now() };
}
