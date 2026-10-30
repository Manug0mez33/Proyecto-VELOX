"use client";
// Client Component ("use client"): Next.js App Router exige que error.jsx sea un Client Component para recibir el objeto error y ejecutar la función interactiva reset() de recuperación.

import Button from "../components/Button";

export default function ErrorPage({ error, reset }) {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col items-center justify-center px-6 lg:px-20 py-16 text-center">
      <div className="max-w-xl rounded-xl bg-[#2A2A2A] border border-[#39FF14]/40 p-8 sm:p-10 space-y-6">
        <span className="inline-block rounded bg-[#3B1D1D] border border-[#F87171] px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-[#F87171]">
          ALERTA DE TELEMETRÍA • ERROR DE EJECUCIÓN
        </span>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#FFFFFF]">
          INTERRUPCIÓN EN PISTA
        </h1>

        <p className="text-sm text-[#D1D5DB] leading-relaxed">
          {error?.message ||
            "No se pudo completar la comunicación con el servidor de rendimiento VELOX. Verifique que la API de Django REST Framework esté activa."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Button variant="primary" onClick={() => reset()}>
            REINTENTAR CONEXIÓN →
          </Button>
          <Button variant="secondary" href="/">
            VOLVER AL INICIO
          </Button>
        </div>
      </div>
    </section>
  );
}
