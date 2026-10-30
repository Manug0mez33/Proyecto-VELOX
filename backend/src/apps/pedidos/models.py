"""
Modelos transaccionales del módulo de Pedidos y Reseñas de VELOX.
Completan los 12 modelos relacionales de la base de datos (Modelos 10, 11 y 12).
"""
from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from apps.productos.models import Producto, VarianteProducto


class Pedido(models.Model):
    """
    Representa una orden de compra realizada por un usuario en VELOX (Modelo #10).
    Registra el estado transaccional, método de pago y dirección de despacho.
    """

    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente de Pago"
        PAGADO = "PAGADO", "Pagado"
        ENVIADO = "ENVIADO", "Enviado"
        ENTREGADO = "ENTREGADO", "Entregado"
        CANCELADO = "CANCELADO", "Cancelado"

    class MetodoPago(models.TextChoices):
        TARJETA_CREDITO = "TARJETA_CREDITO", "Tarjeta de Crédito"
        TARJETA_DEBITO = "TARJETA_DEBITO", "Tarjeta de Débito"
        TRANSFERENCIA = "TRANSFERENCIA", "Transferencia Bancaria"
        EFECTIVO = "EFECTIVO", "Efectivo contra entrega"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="pedidos",
        help_text="Cliente que realizó el pedido.",
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )
    metodo_pago = models.CharField(
        max_length=25,
        choices=MetodoPago.choices,
        default=MetodoPago.TARJETA_CREDITO,
    )
    direccion_envio = models.CharField(
        max_length=255,
        help_text="Dirección física de destino para el despacho.",
    )
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Monto total acumulado de la compra en ARS.",
    )

    class Meta:
        ordering = ["-fecha_creacion"]
        verbose_name = "pedido"
        verbose_name_plural = "pedidos"

    def __str__(self):
        return f"Pedido #{self.id} — {self.usuario.username} (ARS {self.total} - {self.get_estado_display()})"


class DetallePedido(models.Model):
    """
    Línea de ítem perteneciente a un Pedido (Modelo #11).
    Vincula la VarianteProducto física exacta (talle + color + SKU) con la cantidad comprada.
    """

    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name="detalles",
    )
    variante = models.ForeignKey(
        VarianteProducto,
        on_delete=models.PROTECT,
        related_name="detalles_pedido",
    )
    cantidad = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        default=1,
    )
    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Precio congelado al momento de confirmar la compra.",
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    class Meta:
        verbose_name = "detalle de pedido"
        verbose_name_plural = "detalles de pedidos"

    def __str__(self):
        return f"{self.cantidad}x {self.variante.sku} en Pedido #{self.pedido_id}"

    def save(self, *args, **kwargs):
        if not self.precio_unitario:
            self.precio_unitario = self.variante.precio_final
        self.subtotal = self.precio_unitario * self.cantidad
        super().save(*args, **kwargs)


class Resena(models.Model):
    """
    Calificación y opinión sobre un modelo de calzado (Producto) (Modelo #12).
    Restringida a una única reseña por usuario y producto.
    """

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="resenas",
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name="resenas",
    )
    calificacion = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Puntuación de 1 a 5 estrellas.",
    )
    comentario = models.TextField(
        blank=True,
        help_text="Opinión del atleta sobre el rendimiento del calzado.",
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado_en"]
        verbose_name = "reseña"
        verbose_name_plural = "reseñas"
        constraints = [
            models.UniqueConstraint(
                fields=["usuario", "producto"],
                name="resena_unica_por_usuario_y_producto",
            )
        ]

    def __str__(self):
        return f"{self.calificacion}★ de {self.usuario.username} para {self.producto}"
