import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";

// Genera un JWT de prueba con el payload dado (la firma no se valida en el frontend).
const crearToken = (payload) => {
  const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64(payload)}.firma`;
};
const vigente = () => Math.floor(Date.now() / 1000) + 3600;

const pedirDashboard = (token) =>
  proxy(
    new NextRequest("http://localhost:3000/dashboard/pedidos", {
      headers: token ? { cookie: `velox_access_token=${token}` } : {},
    })
  );

describe("proxy.js — protección de /dashboard por sesión y rol", () => {
  it("sin cookie redirige al login recordando la ruta", () => {
    const res = pedirDashboard(null);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?redirect=%2Fdashboard%2Fpedidos");
  });

  it("con token vencido redirige al login", () => {
    const res = pedirDashboard(crearToken({ es_personal_tienda: true, exp: 1 }));
    expect(res.headers.get("location")).toContain("/login");
  });

  it("un CLIENTE logueado es enviado al inicio", () => {
    const res = pedirDashboard(crearToken({ rol: "CLIENTE", es_personal_tienda: false, exp: vigente() }));
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("ADMIN o EMPLEADO pueden pasar", () => {
    const res = pedirDashboard(crearToken({ rol: "EMPLEADO", es_personal_tienda: true, exp: vigente() }));
    expect(res.headers.get("location")).toBeNull();
  });
});
