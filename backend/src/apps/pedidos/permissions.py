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


class EsAutorOStaffOSoloLectura(BasePermission):
    """
    Reseñas: cualquiera puede leerlas, pero solo su autor o el personal (ADMIN/EMPLEADO)
    puede editarlas o eliminarlas.
    """

    message = "Solo el autor de la reseña o el personal de la tienda puede modificarla."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if getattr(request.user, 'es_personal_tienda', False):
            return True
        return obj.usuario_id == request.user.id
