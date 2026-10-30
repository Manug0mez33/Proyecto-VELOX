from django.core.validators import MinValueValidator, RegexValidator
from django.db import models


class Marca(models.Model):
    """Fabricante del calzado (ej. Nike, Adidas). Un producto pertenece a una sola marca."""

    nombre = models.CharField(max_length=100, unique=True)
    origen = models.CharField(max_length=100, blank=True, help_text="País de origen de la marca.")
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "marca"
        verbose_name_plural = "marcas"

    def __str__(self):
        return self.nombre


class Categoria(models.Model):
    """Tipo de calzado según su uso (ej. Running, Training, Básquet)."""

    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "categoría"
        verbose_name_plural = "categorías"

    def __str__(self):
        return self.nombre


class Proveedor(models.Model):
    """Empresa que abastece de mercadería a la tienda. Se identifica por su CUIT."""

    razon_social = models.CharField(max_length=150)
    cuit = models.CharField(
        max_length=13,
        unique=True,
        validators=[RegexValidator(r"^\d{2}-\d{8}-\d$", "Formato de CUIT: XX-XXXXXXXX-X.")],
    )
    email = models.EmailField()
    telefono = models.CharField(max_length=30, blank=True)
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ["razon_social"]
        verbose_name = "proveedor"
        verbose_name_plural = "proveedores"

    def __str__(self):
        return self.razon_social


class Producto(models.Model):
    """
    Modelo comercial del calzado (ej. "Pegasus 40"). Guarda solo los datos
    compartidos por todas sus variantes; el stock real vive en VarianteProducto.
    """

    class Genero(models.TextChoices):
        HOMBRE = "HOMBRE", "Hombre"
        MUJER = "MUJER", "Mujer"
        UNISEX = "UNISEX", "Unisex"

    # PROTECT: no se puede borrar una marca/categoría/proveedor con productos asociados.
    marca = models.ForeignKey(Marca, on_delete=models.PROTECT, related_name="productos")
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name="productos")
    proveedor = models.ForeignKey(Proveedor, on_delete=models.PROTECT, related_name="productos")
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField(blank=True)
    precio_base = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    genero = models.CharField(max_length=10, choices=Genero.choices, default=Genero.UNISEX)
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado_en"]
        verbose_name = "producto"
        verbose_name_plural = "productos"

    def __str__(self):
        return f"{self.marca} {self.nombre}"


class Talle(models.Model):
    """Talle de calzado en un sistema de medida (ej. 41 AR, 9.5 US)."""

    class Sistema(models.TextChoices):
        AR = "AR", "Argentina"
        US = "US", "Estados Unidos"
        EU = "EU", "Europa"
        UK = "UK", "Reino Unido"

    # Decimal para admitir medios talles (ej. 9.5 US).
    numero = models.DecimalField(max_digits=4, decimal_places=1, validators=[MinValueValidator(0)])
    sistema = models.CharField(max_length=2, choices=Sistema.choices, default=Sistema.AR)

    class Meta:
        ordering = ["sistema", "numero"]
        verbose_name = "talle"
        verbose_name_plural = "talles"
        constraints = [
            models.UniqueConstraint(fields=["numero", "sistema"], name="talle_unico_por_sistema"),
        ]

    def __str__(self):
        # "41.0" -> "41", "9.5" -> "9.5"
        return f"{str(self.numero).removesuffix('.0')} {self.sistema}"


class Color(models.Model):
    """Color de una variante, con su código hexadecimal para mostrarlo en el frontend."""

    nombre = models.CharField(max_length=50, unique=True)
    codigo_hex = models.CharField(
        max_length=7,
        validators=[RegexValidator(r"^#[0-9A-Fa-f]{6}$", "Formato hexadecimal: #RRGGBB.")],
    )

    class Meta:
        ordering = ["nombre"]
        verbose_name = "color"
        verbose_name_plural = "colores"

    def __str__(self):
        return self.nombre


class VarianteProducto(models.Model):
    """
    Unidad física vendible: Producto + Talle + Color, identificada por un SKU único.
    Es la tabla que lleva el stock y la que referencian los pedidos.
    """

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="variantes")
    talle = models.ForeignKey(Talle, on_delete=models.PROTECT, related_name="variantes")
    color = models.ForeignKey(Color, on_delete=models.PROTECT, related_name="variantes")
    sku = models.CharField(max_length=30, unique=True)
    stock = models.PositiveIntegerField(default=0)
    # Opcional: si es nulo, la variante se vende al precio_base del producto.
    precio_ajustado = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)]
    )
    activo = models.BooleanField(default=True)

    class Meta:
        ordering = ["producto", "talle", "color"]
        verbose_name = "variante de producto"
        verbose_name_plural = "variantes de producto"
        constraints = [
            # Evita cargar dos veces la misma combinación con SKUs distintos.
            models.UniqueConstraint(fields=["producto", "talle", "color"], name="variante_unica_por_combinacion"),
        ]

    def __str__(self):
        return f"{self.sku} — {self.producto} ({self.talle}, {self.color})"

    @property
    def precio_final(self):
        """Precio de venta efectivo de la variante."""
        return self.precio_ajustado if self.precio_ajustado is not None else self.producto.precio_base


class ImagenProducto(models.Model):
    """Foto de la galería de un producto (relación 1:N para respetar la 1FN)."""

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="imagenes")
    url = models.URLField(max_length=500)
    es_portada = models.BooleanField(default=False)
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["producto", "orden"]
        verbose_name = "imagen de producto"
        verbose_name_plural = "imágenes de producto"
        constraints = [
            # Índice único parcial: como máximo una portada por producto.
            models.UniqueConstraint(
                fields=["producto"], condition=models.Q(es_portada=True), name="una_portada_por_producto"
            ),
        ]

    def __str__(self):
        return f"Imagen {self.orden} de {self.producto}"
