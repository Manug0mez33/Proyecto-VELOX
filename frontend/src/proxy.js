// Proxy de Next.js 16 (antes "middleware", renombrado en esta versión) para proteger /dashboard (R4).
// Exige la Cookie HTTP-Only "velox_access_token" vigente y que el usuario sea personal de la tienda (ADMIN o EMPLEADO).

import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth";
import { esPersonalTienda, isTokenExpired } from "./lib/jwt";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Sin sesión (o token vencido): al login, recordando a dónde quería ir.
  if (!token || isTokenExpired(token)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // Con sesión pero rol CLIENTE: el panel de gestión es solo para el personal.
  if (!esPersonalTienda(token)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
