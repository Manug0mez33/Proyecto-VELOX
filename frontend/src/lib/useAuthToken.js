"use client";
// Hook reutilizable de cliente ("use client"): Sincroniza reactivamente el token JWT y datos de sesión de localStorage entre pestañas y ante eventos de login/logout.

import { useState, useEffect, useCallback, useMemo } from "react";
import { parseJwt, esPersonalTienda } from "./jwt";

/**
 * Hook que mantiene sincronizado el token JWT (`velox_access_token`) y nombre de usuario (`velox_username`)
 * con `localStorage`, escuchando los eventos `velox-auth-changed` y `storage`.
 *
 * @returns {{
 *   token: string|null,
 *   username: string|null,
 *   userId: string|number|null,
 *   rol: string|null,
 *   esPersonal: boolean,
 *   payload: object|null,
 *   refreshAuth: () => string|null
 * }}
 */
export function useAuthToken() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);

  const refreshAuth = useCallback(() => {
    try {
      const storedToken = localStorage.getItem("velox_access_token");
      const storedUser = localStorage.getItem("velox_username");
      setToken(storedToken || null);
      setUsername(storedUser || null);
      return storedToken || null;
    } catch {
      setToken(null);
      setUsername(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshAuth();
    window.addEventListener("velox-auth-changed", refreshAuth);
    window.addEventListener("storage", refreshAuth);
    return () => {
      window.removeEventListener("velox-auth-changed", refreshAuth);
      window.removeEventListener("storage", refreshAuth);
    };
  }, [refreshAuth]);

  const payload = useMemo(() => parseJwt(token), [token]);
  const userId = payload?.user_id ?? null;
  const rol = payload?.rol ?? null;
  const esPersonal = useMemo(
    () => Boolean(token) && esPersonalTienda(token),
    [token]
  );

  return {
    token,
    username,
    userId,
    rol,
    esPersonal,
    payload,
    refreshAuth,
  };
}
