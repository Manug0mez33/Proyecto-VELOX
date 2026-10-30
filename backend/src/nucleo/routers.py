"""
Enrutador central (DefaultRouter) de Django REST Framework para el proyecto VELOX.
Aquí se registran los ViewSets de las aplicaciones de dominio bajo el prefijo '/api/'.
"""
from rest_framework.routers import DefaultRouter
from apps.usuarios.views import UsuarioViewSet

router = DefaultRouter()

# 1. Módulo de Usuarios (Card #17 — 1 de los 8 ViewSets obligatorios)
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
