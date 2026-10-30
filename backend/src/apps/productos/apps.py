from django.apps import AppConfig


class ProductosConfig(AppConfig):
    """Configuración de la app de catálogo e inventario de calzado VELOX."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.productos"
    verbose_name = "Catálogo e Inventario"
