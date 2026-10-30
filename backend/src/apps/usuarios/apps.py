from django.apps import AppConfig


class UsuariosConfig(AppConfig):
    """Configuración de la app de usuarios y roles de VELOX."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.usuarios"
    verbose_name = "Usuarios"
