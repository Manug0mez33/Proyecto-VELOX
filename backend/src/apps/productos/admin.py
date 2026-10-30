from django.contrib import admin

from .models import (
    Categoria,
    Color,
    ImagenProducto,
    Marca,
    Producto,
    Proveedor,
    Talle,
    VarianteProducto,
)


@admin.register(Marca)
class MarcaAdmin(admin.ModelAdmin):
    """Administración de marcas de calzado."""

    list_display = ["nombre", "origen", "activo"]
    list_filter = ["activo", "origen"]
    search_fields = ["nombre", "origen"]
    ordering = ["nombre"]


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    """Administración de categorías de calzado."""

    list_display = ["nombre", "descripcion", "activo"]
    list_filter = ["activo"]
    search_fields = ["nombre", "descripcion"]
    ordering = ["nombre"]


@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    """Administración de proveedores; se buscan por razón social o CUIT."""

    list_display = ["razon_social", "cuit", "email", "telefono", "activo"]
    list_filter = ["activo"]
    search_fields = ["razon_social", "cuit", "email"]
    ordering = ["razon_social"]


class VarianteProductoInline(admin.TabularInline):
    """Permite cargar talles, colores, SKU y stock desde la ficha del producto."""

    model = VarianteProducto
    extra = 1


class ImagenProductoInline(admin.TabularInline):
    """Permite cargar la galería de fotos desde la ficha del producto."""

    model = ImagenProducto
    extra = 1


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    """Administración de productos con sus variantes e imágenes embebidas (inlines)."""

    list_display = ["nombre", "marca", "categoria", "proveedor", "precio_base", "genero", "activo", "creado_en"]
    list_filter = ["activo", "genero", "marca", "categoria", "proveedor"]
    search_fields = ["nombre", "descripcion", "marca__nombre", "categoria__nombre"]
    ordering = ["-creado_en"]
    # Trae marca, categoría y proveedor en el mismo JOIN para evitar N+1 consultas en el listado.
    list_select_related = ["marca", "categoria", "proveedor"]
    inlines = [VarianteProductoInline, ImagenProductoInline]


@admin.register(Talle)
class TalleAdmin(admin.ModelAdmin):
    """Administración de talles por sistema de medida."""

    list_display = ["numero", "sistema"]
    list_filter = ["sistema"]
    search_fields = ["numero"]
    ordering = ["sistema", "numero"]


@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    """Administración de colores disponibles para las variantes."""

    list_display = ["nombre", "codigo_hex"]
    search_fields = ["nombre", "codigo_hex"]
    ordering = ["nombre"]


@admin.register(VarianteProducto)
class VarianteProductoAdmin(admin.ModelAdmin):
    """Control de inventario: stock por SKU, editable directamente desde el listado."""

    list_display = ["sku", "producto", "talle", "color", "stock", "precio_ajustado", "activo"]
    list_filter = ["activo", "talle__sistema", "color", "producto__marca"]
    search_fields = ["sku", "producto__nombre"]
    ordering = ["sku"]
    list_editable = ["stock", "activo"]
    list_select_related = ["producto__marca", "talle", "color"]


@admin.register(ImagenProducto)
class ImagenProductoAdmin(admin.ModelAdmin):
    """Administración de la galería de imágenes de cada producto."""

    list_display = ["producto", "orden", "es_portada", "url"]
    list_filter = ["es_portada"]
    search_fields = ["producto__nombre", "url"]
    ordering = ["producto", "orden"]
    list_select_related = ["producto__marca"]
