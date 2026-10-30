"""
Permisos por rol para el módulo de Pedidos y Reseñas.
"""
from rest_framework.permissions import SAFE_METHODS, BasePermission


class EsPropietarioOStaff(BasePermission):
    """
    Permite el acceso si el usuario es dueño del recurso o si es personal de tienda (ADMIN/EMPLEADO).
    """

    message = "No tiene permiso para ver o modificar este pedido o reseña."

    def has_object_permission(self, request, view, obj):
        if getattr(request.user, 'es_personal_tienda', False):
            return True
        return getattr(obj, 'usuario_id', None) == request.user.id
