// Server Component: 2da ruta dinámica obligatoria de la EFI (/dashboard/pedidos/[id] - R1) que valida el identificador de orden de compra en el servidor e hidrata la isla interactiva PedidoDetalleClient.

import PedidoDetalleClient from "../../../../components/PedidoDetalleClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Orden #${id} | Dashboard VELOX`,
    description: `Ficha de detalle de la orden de compra #${id} en VELOX Performance.`,
  };
}

export default async function PedidoDetallePage({ params }) {
  const { id } = await params;
  return <PedidoDetalleClient id={id} />;
}
