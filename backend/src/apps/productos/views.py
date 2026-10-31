"""
ViewSets del catálogo VELOX (5 de los 8 obligatorios): Producto, Marca, Categoria,
VarianteProducto y Proveedor. ProductoViewSet concentra el NestedSerializer #1,
los filtros django-filter y las acciones @action destacados y stock_por_talle.
"""
from django.db.models import Prefetch, ProtectedError, Q, Sum
from django.db.models.functions import Coalesce
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.usuarios.permissions import EsAdminOEmpleado, EsAdminOEmpleadoOSoloLectura
from nucleo.paginacion import PaginacionCatalogo

from .filters import ProductoFilter
from .models import Categoria, Marca, Producto, Proveedor, VarianteProducto
from .serializers import (
    CategoriaSerializer,
    MarcaSerializer,
    ProductoNestedSerializer,
    ProductoSerializer,
    ProveedorSerializer,
    VarianteProductoSerializer,
)


class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal del catálogo (ViewSet #1).
    - list/retrieve: ProductoNestedSerializer (marca, categoría, imágenes y variantes anidadas).
    - create/update/destroy: ProductoSerializer con IDs; solo ADMIN o EMPLEADO.
    - Filtros: marca, categoria, genero, precio_min/precio_max; búsqueda en nombre y descripción.
    - Paginación de 6 productos por página (PaginacionCatalogo).
    """

    permission_classes = [EsAdminOEmpleadoOSoloLectura]
    pagination_class = PaginacionCatalogo
    filterset_class = ProductoFilter
    search_fields = ["nombre", "descripcion", "marca__nombre", "variantes__sku"]
    ordering_fields = ["precio_base", "creado_en", "nombre"]
    ordering = ["-creado_en"]

    def get_queryset(self):
        """
        Trae relaciones en pocas consultas (select_related / prefetch_related) y suma el
        stock de las variantes activas. El público solo ve productos activos.
        """
        variantes_activas = VarianteProducto.objects.filter(activo=True).select_related("talle", "color")
        queryset = (
            Producto.objects.select_related("marca", "categoria")
            .prefetch_related("imagenes", Prefetch("variantes", queryset=variantes_activas))
            .annotate(stock_total=Coalesce(Sum("variantes__stock", filter=Q(variantes__activo=True)), 0))
        )
        if not getattr(self.request.user, "es_personal_tienda", False):
            queryset = queryset.filter(activo=True)
        return queryset

    def get_serializer_class(self):
        """NestedSerializer para lectura; serializador plano con IDs para escritura."""
        if self.action in ["list", "retrieve", "destacados"]:
            return ProductoNestedSerializer
        return ProductoSerializer

    @action(detail=False, methods=["get"])
    def destacados(self, request):
        """
        @action #1 — GET /api/productos/destacados/
        Devuelve los 6 lanzamientos más recientes que tienen stock disponible (para la home).
        """
        productos = self.get_queryset().filter(activo=True, stock_total__gt=0).order_by("-creado_en")[:6]
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)

    @extend_schema(
        # Documenta en Swagger la respuesta real (no es un Producto, es un resumen por talle).
        responses=inline_serializer(
            name="StockPorTalle",
            fields={
                "producto": serializers.IntegerField(),
                "nombre": serializers.CharField(),
                "talles": serializers.ListField(child=serializers.DictField()),
            },
        )
    )
    @action(detail=True, methods=["get"])
    def stock_por_talle(self, request, pk=None):
        """
        @action #2 — GET /api/productos/{id}/stock_por_talle/
        Agrupa las variantes activas del producto por talle, con el stock total de cada
        talle y el detalle por color/SKU (lo usa la ficha para habilitar talles).
        """
        producto = self.get_object()
        talles = {}
        for variante in producto.variantes.all():  # ya filtradas por activo en el Prefetch
            talle = talles.setdefault(
                variante.talle_id, {"talle": str(variante.talle), "stock_total": 0, "colores": []}
            )
            talle["stock_total"] += variante.stock
            talle["colores"].append(
                {
                    "variante": variante.id,
                    "sku": variante.sku,
                    "color": variante.color.nombre,
                    "codigo_hex": variante.color.codigo_hex,
                    "stock": variante.stock,
                }
            )
        return Response({"producto": producto.id, "nombre": producto.nombre, "talles": list(talles.values())})


class MarcaViewSet(viewsets.ModelViewSet):
    """ViewSet #2 — CRUD de marcas. Lectura pública, escritura solo ADMIN o EMPLEADO."""

    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
    permission_classes = [EsAdminOEmpleadoOSoloLectura]
    filterset_fields = ["activo"]
    search_fields = ["nombre", "origen"]
    ordering_fields = ["nombre"]


class CategoriaViewSet(viewsets.ModelViewSet):
    """ViewSet #3 — CRUD de categorías. Lectura pública, escritura solo ADMIN o EMPLEADO."""

    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [EsAdminOEmpleadoOSoloLectura]
    filterset_fields = ["activo"]
    search_fields = ["nombre", "descripcion"]
    ordering_fields = ["nombre"]


class VarianteProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet #4 — Inventario físico por SKU. Lectura pública (el frontend consulta stock),
    escritura solo ADMIN o EMPLEADO. Se accede por SKU: /api/variantes/NK-PEG40-41-NEG/
    """

    queryset = VarianteProducto.objects.select_related("producto", "talle", "color")
    serializer_class = VarianteProductoSerializer
    permission_classes = [EsAdminOEmpleadoOSoloLectura]
    lookup_field = "sku"
    filterset_fields = ["producto", "talle", "color", "activo"]
    search_fields = ["sku", "producto__nombre"]
    ordering_fields = ["sku", "stock"]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {"detail": "No se puede eliminar la variante porque está asociada a pedidos existentes (integridad referencial protegida)."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProveedorViewSet(viewsets.ModelViewSet):
    """ViewSet #5 — CRUD de proveedores. Solo personal de la tienda (datos comerciales sensibles)."""

    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [EsAdminOEmpleado]
    filterset_fields = ["activo"]
    search_fields = ["razon_social", "cuit", "email"]
    ordering_fields = ["razon_social"]
