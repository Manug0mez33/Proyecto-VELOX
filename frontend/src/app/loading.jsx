// Server Component: Estado de carga global (R1) renderizado desde el servidor utilizando SkeletonCard con acento verde neón sin necesidad de JavaScript de cliente.

import SkeletonCard from "../components/SkeletonCard";

export default function Loading() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 lg:px-20 py-14">
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-md bg-[#1D2B1A] border border-[#39FF14] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[#39FF14] animate-ping" />
          <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-[#39FF14]">
            SINCRONIZANDO TELEMETRÍA VELOX...
          </span>
        </div>
        <div className="h-9 w-80 rounded bg-[#2A2A2A] animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded bg-[#2A2A2A] animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  );
}
