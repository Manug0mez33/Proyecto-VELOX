"""
Serializadores del módulo de Usuarios de VELOX.
Respetan estrictamente la convención snake_case pactada con el Frontend en Next.js (Zod / React Hook Form).
"""
from rest_framework import serializers
from apps.usuarios.models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador de lectura y representación de perfiles de usuario.
    Se utiliza en listados, detalle de cuenta y como serializador anidado en PedidoViewSet.
    """

    rol_display = serializers.CharField(source='get_rol_display', read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'rol',
            'rol_display',
            'telefono',
            'direccion',
            'ciudad',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined', 'rol_display']


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador de escritura para el alta (POST /api/usuarios/) y actualización de usuarios.
    Garantiza el hasheo seguro de la contraseña mediante set_password() y protege la escalada de rol.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text='Contraseña de al menos 8 caracteres.',
    )

    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'rol',
            'telefono',
            'direccion',
            'ciudad',
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'rol': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_rol(self, valor: str) -> str:
        """
        Impide que un visitante no autenticado o un CLIENTE se auto-asigne rol ADMIN o EMPLEADO.
        Solo un usuario con rol ADMIN puede crear cuentas con roles administrativos.
        """
        request = self.context.get('request')
        usuario_actual = getattr(request, 'user', None)
        if usuario_actual and usuario_actual.is_authenticated and getattr(usuario_actual, 'es_administrador', False):
            return valor
        return Usuario.Rol.CLIENTE

    def create(self, validated_data: dict) -> Usuario:
        """Crea la instancia de Usuario encriptando la contraseña con el algoritmo PBKDF2 de Django."""
        password = validated_data.pop('password')
        if 'rol' not in validated_data:
            validated_data['rol'] = Usuario.Rol.CLIENTE
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario

    def update(self, instance: Usuario, validated_data: dict) -> Usuario:
        """Actualiza los datos del usuario; si se envía password, vuelve a encriptarla."""
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
