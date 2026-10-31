"""
Enrutador central (DefaultRouter) de Django REST Framework para el proyecto VELOX.
Aquí se registran los ViewSets de las aplicaciones de dominio bajo el prefijo '/api/'.
"""
from rest_framework.routers import DefaultRouter
from apps.usuarios.views import UsuarioViewSet
from apps.pedidos.views import PedidoViewSet, ResenaViewSet
from apps.productos.views import (
    CategoriaViewSet,
    MarcaViewSet,
    ProductoViewSet,
    ProveedorViewSet,
    VarianteProductoViewSet,
)

router = DefaultRouter()

# 1. Módulo de Usuarios (Card #17)
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

# 2. Módulo de Pedidos y Reseñas (Card #22)
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'resenas', ResenaViewSet, basename='resena')

# 3. Módulo de Catálogo e Inventario (Card: ViewSets de Catálogo)
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'marcas', MarcaViewSet, basename='marca')
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'variantes', VarianteProductoViewSet, basename='variante')
router.register(r'proveedores', ProveedorViewSet, basename='proveedor')
