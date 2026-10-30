"""
Clases de permiso personalizadas (BasePermission) para proteger los endpoints de DRF según el rol.
Defensa oral: centralizar la autorización por rol evita repetir condicionales dentro de las vistas.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission


class EsAdministrador(BasePermission):
    """Permite el acceso exclusivamente a usuarios con rol ADMIN o superusuarios."""

    message = 'Acceso restringido: se requiere rol de Administrador en VELOX.'

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'es_administrador', False)
        )


class EsAdminOEmpleado(BasePermission):
    """Permite el acceso únicamente al personal interno de la tienda (ADMIN o EMPLEADO)."""

    message = 'Acceso restringido: se requiere rol de Administrador o Empleado.'

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'es_personal_tienda', False)
        )


class EsAdminOEmpleadoOSoloLectura(BasePermission):
    """
    Permite consultas públicas de lectura (GET, HEAD, OPTIONS) para el catálogo,
    pero restringe las operaciones de escritura (POST, PUT, PATCH, DELETE) a ADMIN o EMPLEADO.
    """

    message = 'Solo el personal autorizado (ADMIN o EMPLEADO) puede modificar el catálogo.'

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'es_personal_tienda', False)
        )


class PermisoUsuarioViewSet(BasePermission):
    """
    Política de acceso para UsuarioViewSet:
    - 'create' (POST /api/usuarios/): Público (AllowAny) para permitir el registro de nuevos clientes.
    - 'list' (GET /api/usuarios/): Requiere estar autenticado (el queryset filtra según rol).
    - 'retrieve', 'update', 'partial_update': El propio usuario titular o un ADMIN/EMPLEADO.
    - 'destroy' (DELETE): Exclusivo para usuarios con rol ADMIN.
    """

    message = 'No tiene permisos suficientes para realizar esta operación sobre la cuenta de usuario.'

    def has_permission(self, request, view) -> bool:
        if getattr(view, 'action', None) == 'create':
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        if getattr(request.user, 'es_administrador', False):
            return True
        if getattr(view, 'action', None) == 'destroy':
            return False
        if getattr(request.user, 'es_personal_tienda', False) and request.method in SAFE_METHODS:
            return True
        return obj.pk == request.user.pk
