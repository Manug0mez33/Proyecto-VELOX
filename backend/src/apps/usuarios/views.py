"""
ViewSet principal para la gestión de Usuarios de VELOX (ViewSet #1 de los 8 ViewSets obligatorios).
Incluye filtrado por rol/ciudad, búsqueda por texto y endpoint '/api/usuarios/perfil/' para el usuario activo.
"""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.usuarios.models import Usuario
from apps.usuarios.permissions import PermisoUsuarioViewSet
from apps.usuarios.serializers import RegistroUsuarioSerializer, UsuarioSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    API Endpoint para registrar nuevos atletas (POST público) y administrar cuentas de usuario.
    - Los usuarios ADMIN y EMPLEADO pueden consultar el listado paginado de clientes.
    - Un usuario CLIENTE solo visualiza y edita su propio registro por privacidad.
    """

    queryset = Usuario.objects.all().order_by('-date_joined')
    permission_classes = [PermisoUsuarioViewSet]
    filterset_fields = ['rol', 'ciudad', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'ciudad']
    ordering_fields = ['date_joined', 'username', 'email']

    def get_queryset(self):
        """Restringe el listado para que un CLIENTE común solo acceda a su propio perfil."""
        user = self.request.user
        if not user or not user.is_authenticated:
            return Usuario.objects.none()
        if getattr(user, 'es_personal_tienda', False):
            return Usuario.objects.all().order_by('-date_joined')
        return Usuario.objects.filter(pk=user.pk)

    def get_serializer_class(self):
        """
        Selecciona dinámicamente el serializador según la acción HTTP:
        - RegistroUsuarioSerializer para creación/edición (manejo de password).
        - UsuarioSerializer para listados y lecturas de detalle.
        """
        if self.action in ('create', 'update', 'partial_update'):
            return RegistroUsuarioSerializer
        return UsuarioSerializer

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def perfil(self, request):
        """
        Devuelve o actualiza parcialmente los datos del usuario autenticado mediante su token JWT.
        Ruta: GET / PATCH '/api/usuarios/perfil/'
        """
        if request.method == 'PATCH':
            serializer = RegistroUsuarioSerializer(
                request.user,
                data=request.data,
                partial=True,
                context={'request': request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UsuarioSerializer(request.user).data, status=status.HTTP_200_OK)

        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
