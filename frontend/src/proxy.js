// Proxy de Next.js 16 (antes "middleware", renombrado en esta versión) para proteger rutas por sesión y rol (R4).
// /dashboard es solo para el personal (ADMIN o EMPLEADO), /dashboard/usuarios solo para ADMIN y /mis-pedidos solo para clientes.

import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth";
import { esAdministrador, esPersonalTienda, isTokenExpired } from "./lib/jwt";

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

  const esPersonal = esPersonalTienda(token);

  // Con sesión pero rol CLIENTE: el panel de gestión es solo para el personal.
  if (pathname.startsWith("/dashboard") && !esPersonal) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // La gestión de usuarios y roles es exclusiva del ADMIN (un EMPLEADO vuelve al resumen).
  if (pathname.startsWith("/dashboard/usuarios") && !esAdministrador(token)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // "Mis pedidos" es la vista del cliente; el personal gestiona todos los pedidos en el dashboard.
  if (pathname.startsWith("/mis-pedidos") && esPersonal) {
    return NextResponse.redirect(new URL("/dashboard/pedidos", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/mis-pedidos/:path*"],
};
