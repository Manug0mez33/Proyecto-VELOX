"""
Filtros django-filter del catálogo VELOX.
"""
import django_filters

from .models import Producto, VarianteProducto


class ProductoFilter(django_filters.FilterSet):
    """
    Filtros de ProductoViewSet por marca, categoría, género y rango de precio.
    Ej: /api/productos/?marca=1&genero=UNISEX&precio_min=100000&precio_max=200000
    """

    precio_min = django_filters.NumberFilter(field_name="precio_base", lookup_expr="gte")
    precio_max = django_filters.NumberFilter(field_name="precio_base", lookup_expr="lte")
    sku = django_filters.CharFilter(method="filtrar_por_sku")

    class Meta:
        model = Producto
        fields = ["marca", "categoria", "genero", "activo"]

    def filtrar_por_sku(self, queryset, name, value):
        """
        Productos con alguna variante cuyo SKU contenga el texto. Se usa una subconsulta
        (id__in) en vez de un JOIN para no multiplicar el stock_total anotado en el ViewSet.
        """
        productos_con_sku = VarianteProducto.objects.filter(sku__icontains=value).values("producto_id")
        return queryset.filter(id__in=productos_con_sku)
