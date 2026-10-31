"""
Manejo global de excepciones de la API VELOX (setting EXCEPTION_HANDLER de DRF).
"""
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def manejador_excepciones_velox(exc, context):
    """
    Extiende el manejador de DRF: un borrado bloqueado por on_delete=PROTECT
    (ej. una variante que figura en pedidos) responde 409 con un mensaje claro
    en lugar de un error 500.
    """
    if isinstance(exc, ProtectedError):
        # protected_objects: los registros que impiden el borrado (ej. detalles de pedido).
        objeto = next(iter(exc.protected_objects))
        cantidad = len(exc.protected_objects)
        relacion = objeto._meta.verbose_name if cantidad == 1 else objeto._meta.verbose_name_plural
        return Response(
            {
                'detail': (
                    f'No se puede eliminar porque está asociado a {cantidad} {relacion}. '
                    'Si querés que deje de mostrarse o venderse, desactivalo desde Editar.'
                )
            },
            status=status.HTTP_409_CONFLICT,
        )
    return exception_handler(exc, context)
