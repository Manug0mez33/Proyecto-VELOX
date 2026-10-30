// Server Component: Esqueleto visual de carga sin lógica interactiva ni hooks de cliente, utilizado por loading.jsx con animate-pulse de Tailwind CSS.

export default function SkeletonCard() {
  return (
    <div
      className="flex flex-col justify-between rounded-lg bg-[#2A2A2A] border border-[#383838] p-4 h-[480px] animate-pulse"
      aria-hidden="true"
    >
      <div>
        <div className="relative h-[210px] w-full rounded-md bg-[#181818] mb-5 flex items-center justify-center">
          <span className="text-xs font-mono text-[#39FF14]/50 tracking-widest uppercase">
            Cargando telemetría VELOX...
          </span>
        </div>
        <div className="h-3.5 w-36 rounded bg-[#383838] mb-3" />
        <div className="h-6 w-3/4 rounded bg-[#383838] mb-3" />
        <div className="h-3.5 w-full rounded bg-[#383838] mb-2" />
        <div className="h-3.5 w-2/3 rounded bg-[#383838] mb-5" />
        <div className="flex gap-2">
          <div className="h-7 w-10 rounded bg-[#181818]" />
          <div className="h-7 w-10 rounded bg-[#181818]" />
          <div className="h-7 w-10 rounded bg-[#181818]" />
          <div className="h-7 w-10 rounded bg-[#181818]" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#383838]">
        <div className="h-8 w-28 rounded bg-[#383838]" />
        <div className="h-11 w-40 rounded-lg bg-[#39FF14]/30" />
      </div>
    </div>
  );
}
