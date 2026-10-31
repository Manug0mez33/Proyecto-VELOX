"""
Filtros django-filter del catálogo VELOX.
"""
import django_filters

from .models import Producto


class ProductoFilter(django_filters.FilterSet):
    """
    Filtros de ProductoViewSet por marca, categoría, género y rango de precio.
    Ej: /api/productos/?marca=1&genero=UNISEX&precio_min=100000&precio_max=200000
    """

    precio_min = django_filters.NumberFilter(field_name="precio_base", lookup_expr="gte")
    precio_max = django_filters.NumberFilter(field_name="precio_base", lookup_expr="lte")
    sku = django_filters.CharFilter(field_name="variantes__sku", lookup_expr="icontains")

    class Meta:
        model = Producto
        fields = ["marca", "categoria", "genero", "activo"]
