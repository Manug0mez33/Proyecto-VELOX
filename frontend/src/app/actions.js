"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  USER_COOKIE_NAME,
} from "../lib/auth";
import { esPersonalTienda } from "../lib/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Server Action para iniciar sesión contra Django REST Framework (SimpleJWT).
 * Almacena los tokens en Cookies HTTP-Only (R4).
 */
export async function loginAction(payload) {
  const username = payload?.username || payload?.get?.("username");
  const password = payload?.password || payload?.get?.("password");

  if (!username || !password) {
    return { success: false, error: "El usuario y la contraseña son obligatorios." };
  }

  const res = await fetch(`${API_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  }).catch(() => null);

  if (!res) return { success: false, error: "No se pudo conectar con el servidor." };
  if (res.status === 401) {
    return { success: false, error: "No existe una cuenta activa con las credenciales ingresadas." };
  }
  if (!res.ok) return { success: false, error: "Error de autenticación con el servidor." };

  const data = await res.json().catch(() => ({}));
  if (!data.access) return { success: false, error: "El servidor no retornó token de acceso." };

  // Guardar Cookies HTTP-Only en el servidor (R4)
  const cookieStore = await cookies();
  const cookieConfig = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 horas
  };

  cookieStore.set(AUTH_COOKIE_NAME, data.access, cookieConfig);
  if (data.refresh) {
    cookieStore.set(REFRESH_COOKIE_NAME, data.refresh, { ...cookieConfig, maxAge: 60 * 60 * 24 * 7 });
  }
  cookieStore.set(USER_COOKIE_NAME, username, { ...cookieConfig, httpOnly: false });

  return {
    success: true,
    access: data.access,
    refresh: data.refresh,
    username,
    es_personal_tienda: esPersonalTienda(data.access),
  };
}

/**
 * Server Action para cerrar sesión.
 * Elimina las Cookies HTTP-Only y revalida las páginas protegidas.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);

  revalidatePath("/dashboard");
  revalidatePath("/productos");
  return { success: true };
}
