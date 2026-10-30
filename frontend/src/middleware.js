// Middleware de Next.js para protección de rutas privadas (R4).
// Verifica la presencia de la Cookie HTTP-Only "velox_access_token" antes de permitir el acceso a /dashboard.

import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Proteger rutas administrativas del dashboard
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
