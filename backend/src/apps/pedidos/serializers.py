"""
Serializadores de Pedidos y Reseñas de VELOX.
Incluye el NestedSerializer #2 en list/retrieve y el serializador transaccional con control de stock.
"""
from django.db import transaction
from rest_framework import serializers

from apps.pedidos.models import DetallePedido, Pedido, Resena
from apps.productos.models import VarianteProducto
from apps.usuarios.serializers import UsuarioSerializer


class DetallePedidoSerializer(serializers.ModelSerializer):
    """
    Serializador de lectura para cada línea de un pedido.
    Desglosa la información del SKU, producto, talle y color para el frontend.
    """

    sku = serializers.CharField(source='variante.sku', read_only=True)
    producto_nombre = serializers.CharField(source='variante.producto.nombre', read_only=True)
    talle_detalle = serializers.CharField(source='variante.talle.__str__', read_only=True)
    color_nombre = serializers.CharField(source='variante.color.nombre', read_only=True)
    color_hex = serializers.CharField(source='variante.color.codigo_hex', read_only=True)

    class Meta:
        model = DetallePedido
        fields = [
            'id',
            'variante',
            'sku',
            'producto_nombre',
            'talle_detalle',
            'color_nombre',
            'color_hex',
            'cantidad',
            'precio_unitario',
            'subtotal',
        ]
        read_only_fields = ['id', 'precio_unitario', 'subtotal']


class ItemPedidoCreateSerializer(serializers.Serializer):
    """Sub-esquema de entrada para cada ítem en el payload de creación de pedido."""

    variante = serializers.PrimaryKeyRelatedField(
        queryset=VarianteProducto.objects.filter(activo=True),
        help_text="ID de la variante SKU a adquirir.",
    )
    cantidad = serializers.IntegerField(
        min_value=1,
        default=1,
        help_text="Cantidad de pares requerida (mínimo 1).",
    )


class PedidoCreateSerializer(serializers.ModelSerializer):
    """
    Serializador de escritura para Checkout (POST /api/pedidos/).
    Ejecuta validación atómica de stock y descuento en VarianteProducto (transaction.atomic).
    """

    detalles = ItemPedidoCreateSerializer(many=True, write_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id',
            'metodo_pago',
            'direccion_envio',
            'detalles',
            'total',
            'estado',
            'fecha_creacion',
        ]
        read_only_fields = ['id', 'total', 'estado', 'fecha_creacion']

    def validate_detalles(self, items):
        if not items:
            raise serializers.ValidationError("El pedido debe contener al menos un producto.")
        
        # Validación preliminar de stock
        for item in items:
            variante = item['variante']
            cantidad = item['cantidad']
            if variante.stock < cantidad:
                raise serializers.ValidationError(
                    f"Stock insuficiente para '{variante.sku}'. "
                    f"Disponible: {variante.stock} u., solicitado: {cantidad} u."
                )
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('detalles')
        usuario = self.context['request'].user

        with transaction.atomic():
            # Crear cabecera de pedido
            pedido = Pedido.objects.create(
                usuario=usuario,
                metodo_pago=validated_data.get('metodo_pago', Pedido.MetodoPago.TARJETA_CREDITO),
                direccion_envio=validated_data.get('direccion_envio', ''),
                estado=Pedido.Estado.PENDIENTE,
                total=0,
            )

            total_acumulado = 0

            # Procesar cada detalle con lock de fila para concurrencia segura
            for item in items_data:
                variante_id = item['variante'].id
                cantidad = item['cantidad']

                # select_for_update garantiza que dos compras simultáneas no generen stock negativo
                variante = VarianteProducto.objects.select_for_update().get(id=variante_id)

                if variante.stock < cantidad:
                    raise serializers.ValidationError(
                        f"Stock agotado durante la transacción para '{variante.sku}'. "
                        f"Disponible: {variante.stock} u., solicitado: {cantidad} u."
                    )

                # Descontar stock atómicamente
                variante.stock -= cantidad
                variante.save(update_fields=['stock'])

                precio = variante.precio_final
                subtotal = precio * cantidad
                total_acumulado += subtotal

                DetallePedido.objects.create(
                    pedido=pedido,
                    variante=variante,
                    cantidad=cantidad,
                    precio_unitario=precio,
                    subtotal=subtotal,
                )

            pedido.total = total_acumulado
            pedido.save(update_fields=['total'])

        return pedido


class PedidoListSerializer(serializers.ModelSerializer):
    """
    NestedSerializer #2 exigido por la consigna (en 'list' y 'retrieve').
    Anida los datos completos del Usuario comprador y la lista de DetallePedido con sus variantes.
    """

    usuario = UsuarioSerializer(read_only=True)
    detalles = DetallePedidoSerializer(many=True, read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    metodo_pago_display = serializers.CharField(source='get_metodo_pago_display', read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id',
            'usuario',
            'estado',
            'estado_display',
            'metodo_pago',
            'metodo_pago_display',
            'direccion_envio',
            'total',
            'detalles',
            'fecha_creacion',
            'actualizado_en',
        ]
        read_only_fields = fields


class ResenaSerializer(serializers.ModelSerializer):
    """
    Serializador para la valoración de calzados (ResenaViewSet).
    Asocia automáticamente al usuario autenticado y valida la nota de 1 a 5.
    """

    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = Resena
        fields = [
            'id',
            'usuario',
            'usuario_nombre',
            'producto',
            'producto_nombre',
            'calificacion',
            'comentario',
            'creado_en',
        ]
        read_only_fields = ['id', 'usuario', 'creado_en']

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        producto = attrs.get('producto')
        if user and user.is_authenticated and producto:
            if not self.instance and Resena.objects.filter(usuario=user, producto=producto).exists():
                raise serializers.ValidationError(
                    {"producto": "Ya has publicado una reseña para este calzado deportivo."}
                )
        return attrs

    def create(self, validated_data):
        if 'usuario' not in validated_data and 'request' in self.context:
            validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)
