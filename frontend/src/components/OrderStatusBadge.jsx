// Server Component: Etiqueta semántica sin estado para representar el estado de una orden de compra (PENDIENTE, PAGADO, ENVIADO, ENTREGADO, CANCELADO) con cero costo de hidratación.

import Badge from "./Badge";

export default function OrderStatusBadge({ estado, estadoDisplay }) {
  const label = estadoDisplay || estado || "PENDIENTE";

  switch (estado) {
    case "ENTREGADO":
      return <Badge variant="neon">{label}</Badge>;
    case "PAGADO":
      return <Badge variant="outline">{label}</Badge>;
    case "ENVIADO":
      return (
        <span className="inline-flex items-center justify-center rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#1E293B] text-[#38BDF8] border border-[#0284C7]">
          {label}
        </span>
      );
    case "CANCELADO":
      return <Badge variant="danger">{label}</Badge>;
    case "PENDIENTE":
    default:
      return (
        <span className="inline-flex items-center justify-center rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#332510] text-[#FBBF24] border border-[#B45309]">
          {label}
        </span>
      );
  }
}
