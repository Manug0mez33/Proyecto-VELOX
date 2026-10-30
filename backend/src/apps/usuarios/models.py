from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    """
    Usuario del sistema. Hereda todo el sistema de autenticación de Django
    (contraseñas, sesiones, permisos) y agrega el rol para autorizar endpoints.
    """

    class Rol(models.TextChoices):
        ADMIN = "ADMIN", "Administrador"
        EMPLEADO = "EMPLEADO", "Empleado"
        CLIENTE = "CLIENTE", "Cliente"

    # Alias para compatibilidad semántica en serializers y permisos
    RolesChoices = Rol

    email = models.EmailField(unique=True)
    rol = models.CharField(max_length=10, choices=Rol.choices, default=Rol.CLIENTE)
    telefono = models.CharField(max_length=30, blank=True)
    direccion = models.CharField(max_length=200, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return f"{self.username} ({self.rol})"

    @property
    def es_administrador(self) -> bool:
        """Retorna True si el usuario posee rol ADMIN o es superusuario de Django."""
        return bool(self.is_superuser or self.rol == self.Rol.ADMIN)

    @property
    def es_personal_tienda(self) -> bool:
        """Retorna True si el usuario es ADMIN o EMPLEADO (autorizado a gestionar stock y catálogo)."""
        return bool(
            self.is_superuser
            or self.rol in (self.Rol.ADMIN, self.Rol.EMPLEADO)
        )
