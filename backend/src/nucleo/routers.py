"""
Enrutador central (DefaultRouter) de Django REST Framework para el proyecto VELOX.
Aquí se registran los ViewSets de las aplicaciones de dominio bajo el prefijo '/api/'.
"""
from rest_framework.routers import DefaultRouter
from apps.usuarios.views import UsuarioViewSet
from apps.pedidos.views import PedidoViewSet, ResenaViewSet

router = DefaultRouter()

# 1. Módulo de Usuarios (Card #17)
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

# 2. Módulo de Pedidos y Reseñas (Card #22)
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'resenas', ResenaViewSet, basename='resena')
