"""
Serializadores del catálogo VELOX.
Separados por responsabilidad: serializadores planos (con IDs) para escritura y
ProductoNestedSerializer (NestedSerializer #1 de la consigna) para list/retrieve.
"""
from rest_framework import serializers

from .models import Categoria, ImagenProducto, Marca, Producto, Proveedor, VarianteProducto


class MarcaSerializer(serializers.ModelSerializer):
    """CRUD de marcas; también se anida dentro de ProductoNestedSerializer."""

    class Meta:
        model = Marca
        fields = ["id", "nombre", "origen", "activo"]


class CategoriaSerializer(serializers.ModelSerializer):
    """CRUD de categorías; también se anida dentro de ProductoNestedSerializer."""

    class Meta:
        model = Categoria
        fields = ["id", "nombre", "descripcion", "activo"]


class ProveedorSerializer(serializers.ModelSerializer):
    """CRUD de proveedores (solo personal de la tienda: expone CUIT y datos de contacto)."""

    class Meta:
        model = Proveedor
        fields = ["id", "razon_social", "cuit", "email", "telefono", "activo"]


class ImagenProductoSerializer(serializers.ModelSerializer):
    """Foto de la galería de un producto, anidada en ProductoNestedSerializer."""

    class Meta:
        model = ImagenProducto
        fields = ["id", "url", "es_portada", "orden"]


class VarianteResumenSerializer(serializers.ModelSerializer):
    """
    Resumen de una variante para anidar dentro del producto: lo justo para que el
    frontend arme el selector de talle/color y agregue el SKU al carrito.
    """

    talle = serializers.StringRelatedField()
    color = serializers.CharField(source="color.nombre")
    codigo_hex = serializers.CharField(source="color.codigo_hex")
    precio_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = VarianteProducto
        fields = ["id", "sku", "talle", "color", "codigo_hex", "stock", "precio_final"]


class VarianteProductoSerializer(serializers.ModelSerializer):
    """
    CRUD de variantes (inventario físico). En escritura recibe IDs de producto, talle
    y color; en lectura agrega campos descriptivos y el precio final calculado.
    """

    producto_nombre = serializers.CharField(source="producto.nombre", read_only=True)
    talle_detalle = serializers.StringRelatedField(source="talle", read_only=True)
    color_nombre = serializers.CharField(source="color.nombre", read_only=True)
    precio_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = VarianteProducto
        fields = [
            "id",
            "producto",
            "producto_nombre",
            "talle",
            "talle_detalle",
            "color",
            "color_nombre",
            "sku",
            "stock",
            "precio_ajustado",
            "precio_final",
            "activo",
        ]


class ProductoSerializer(serializers.ModelSerializer):
    """
    Serializador plano para crear/editar productos. Las relaciones viajan como IDs
    (PrimaryKeyRelatedField, el comportamiento por defecto de ModelSerializer).
    """

    class Meta:
        model = Producto
        fields = [
            "id",
            "marca",
            "categoria",
            "proveedor",
            "nombre",
            "descripcion",
            "precio_base",
            "genero",
            "activo",
            "creado_en",
        ]
        read_only_fields = ["id", "creado_en"]


class ProductoNestedSerializer(serializers.ModelSerializer):
    """
    NestedSerializer #1 exigido por la consigna (acciones list y retrieve).
    Anida marca, categoría, galería de imágenes y el resumen de variantes, para que
    el frontend arme la tarjeta y la ficha del calzado con una sola petición.
    """

    marca = MarcaSerializer(read_only=True)
    categoria = CategoriaSerializer(read_only=True)
    imagenes = ImagenProductoSerializer(many=True, read_only=True)
    variantes = VarianteResumenSerializer(many=True, read_only=True)
    genero_display = serializers.CharField(source="get_genero_display", read_only=True)
    # stock_total se calcula en la consulta del ViewSet (annotate + Sum).
    stock_total = serializers.IntegerField(read_only=True)
    imagen_portada = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = [
            "id",
            "nombre",
            "descripcion",
            "precio_base",
            "genero",
            "genero_display",
            "activo",
            "creado_en",
            "marca",
            "categoria",
            "imagen_portada",
            "imagenes",
            "stock_total",
            "variantes",
        ]

    def get_imagen_portada(self, producto) -> str | None:
        """Devuelve la URL de la portada (o la primera foto) para la tarjeta del catálogo."""
        imagenes = list(producto.imagenes.all())  # usa el prefetch, sin consultas extra
        portada = next((img for img in imagenes if img.es_portada), imagenes[0] if imagenes else None)
        return portada.url if portada else None
