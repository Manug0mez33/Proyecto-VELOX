"""
Configuración del Panel de Administración para Pedidos y Reseñas.
"""
from django.contrib import admin
from apps.pedidos.models import DetallePedido, Pedido, Resena


class DetallePedidoInline(admin.TabularInline):
    model = DetallePedido
    extra = 0
    readonly_fields = ('variante', 'cantidad', 'precio_unitario', 'subtotal')
    can_delete = False


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'estado', 'metodo_pago', 'total', 'fecha_creacion')
    list_filter = ('estado', 'metodo_pago', 'fecha_creacion')
    search_fields = ('id', 'usuario__username', 'usuario__email', 'direccion_envio')
    ordering = ('-fecha_creacion',)
    inlines = [DetallePedidoInline]
    readonly_fields = ('total', 'fecha_creacion', 'actualizado_en')


@admin.register(Resena)
class ResenaAdmin(admin.ModelAdmin):
    list_display = ('id', 'producto', 'usuario', 'calificacion', 'creado_en')
    list_filter = ('calificacion', 'creado_en')
    search_fields = ('producto__nombre', 'usuario__username', 'comentario')
    ordering = ('-creado_en',)
