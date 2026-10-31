"""
ViewSets transaccionales de Pedidos y Reseñas (ViewSets 7 y 8 de la consigna).
Incluye NestedSerializer en list/retrieve y la acción personalizada @action cancelar_pedido.
"""
from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from apps.pedidos.models import Pedido, Resena
from apps.pedidos.permissions import EsPropietarioOStaff
from apps.pedidos.serializers import (
    PedidoCreateSerializer,
    PedidoListSerializer,
    ResenaSerializer,
)


class PedidoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la creación (Checkout) y consulta de pedidos (ViewSet #7 de los 8 obligatorios).
    - 'list' y 'retrieve': Utilizan PedidoListSerializer (NestedSerializer #2).
    - 'create': Utiliza PedidoCreateSerializer (validación y descuento atómico de stock).
    - Clientes solo acceden a sus propios pedidos; ADMIN y EMPLEADO acceden a todos.
    """

    permission_classes = [IsAuthenticated, EsPropietarioOStaff]
    filterset_fields = ['estado', 'metodo_pago']
    ordering_fields = ['fecha_creacion', 'total']

    def get_queryset(self):
        user = self.request.user
        base_qs = Pedido.objects.all().select_related('usuario').prefetch_related(
            'detalles__variante__producto',
            'detalles__variante__talle',
            'detalles__variante__color',
        )
        # drf-spectacular genera el schema con un usuario anónimo: se devuelve el queryset sin filtrar.
        if getattr(self, 'swagger_fake_view', False) or getattr(user, 'es_personal_tienda', False):
            return base_qs.order_by('-fecha_creacion')
        return base_qs.filter(usuario=user).order_by('-fecha_creacion')

    def get_serializer_class(self):
        """Selecciona NestedSerializer para list/retrieve o CreateSerializer para POST."""
        if self.action == 'create':
            return PedidoCreateSerializer
        return PedidoListSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancelar_pedido(self, request, pk=None):
        """
        Acción personalizada (@action #3 obligatoria):
        Pasa el estado a CANCELADO y restituye automáticamente el stock a cada VarianteProducto.
        Ruta: POST /api/pedidos/{id}/cancelar_pedido/
        """
        pedido = self.get_object()

        if pedido.estado == Pedido.Estado.CANCELADO:
            return Response(
                {'detail': 'El pedido ya se encuentra cancelado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if pedido.estado in (Pedido.Estado.ENVIADO, Pedido.Estado.ENTREGADO):
            return Response(
                {'detail': f'No se puede cancelar un pedido en estado {pedido.get_estado_display()}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Restitución atómica de stock
        with transaction.atomic():
            detalles = pedido.detalles.select_related('variante').select_for_update()
            for det in detalles:
                var = det.variante
                var.stock += det.cantidad
                var.save(update_fields=['stock'])

            pedido.estado = Pedido.Estado.CANCELADO
            pedido.save(update_fields=['estado'])

        serializer = PedidoListSerializer(pedido)
        return Response(
            {
                'detail': f'Pedido #{pedido.id} cancelado correctamente. Se restituyó el stock de los artículos.',
                'pedido': serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class ResenaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la consulta y creación de reseñas de calzado (ViewSet #8 de los 8 obligatorios).
    Permite lectura pública y escritura autenticada.
    """

    queryset = Resena.objects.all().select_related('usuario', 'producto')
    serializer_class = ResenaSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ['producto', 'calificacion']
    search_fields = ['comentario', 'usuario__username', 'producto__nombre']
    ordering_fields = ['creado_en', 'calificacion']

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
