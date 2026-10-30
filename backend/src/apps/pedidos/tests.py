"""
Tests de integración para Pedidos, Descuento Atómico de Stock, @action cancelar_pedido y Reseñas.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.pedidos.models import Pedido, Resena
from apps.productos.models import Categoria, Color, Marca, Producto, Proveedor, Talle, VarianteProducto

Usuario = get_user_model()


class PedidosYResenasTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Crear usuario cliente
        self.cliente = Usuario.objects.create_user(
            username='cliente_test',
            email='cliente@test.com',
            password='Password123!',
            rol=Usuario.Rol.CLIENTE,
        )

        # Crear datos maestros de catálogo
        self.marca = Marca.objects.create(nombre='VELOX TEST')
        self.categoria = Categoria.objects.create(nombre='Running Test')
        self.proveedor = Proveedor.objects.create(
            razon_social='Proveedor Test S.A.',
            cuit='30-71548963-9',
            email='proveedor@test.com',
        )
        self.producto = Producto.objects.create(
            marca=self.marca,
            categoria=self.categoria,
            proveedor=self.proveedor,
            nombre='Velox Carbon Test',
            precio_base=100000.00,
        )
        self.talle = Talle.objects.create(numero=42, sistema=Talle.Sistema.AR)
        self.color = Color.objects.create(nombre='Negro Neón', codigo_hex='#39FF14')

        # Crear variante con stock = 10
        self.variante = VarianteProducto.objects.create(
            producto=self.producto,
            talle=self.talle,
            color=self.color,
            sku='VLX-TEST-42-NEO',
            stock=10,
        )

        self.client.force_authenticate(user=self.cliente)

    def test_creacion_pedido_descuenta_stock_atomicamente(self):
        """Verifica que POST /api/pedidos/ descuente el stock y calcule subtotales."""
        payload = {
            'metodo_pago': 'TARJETA_CREDITO',
            'direccion_envio': 'Av. España 450, Río Cuarto',
            'detalles': [
                {'variante': self.variante.id, 'cantidad': 3}
            ],
        }
        res = self.client.post('/api/pedidos/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Verificar descuento de stock en la variante
        self.variante.refresh_from_db()
        self.assertEqual(self.variante.stock, 7)  # 10 - 3 = 7

        # Verificar total del pedido
        pedido = Pedido.objects.get(id=res.data['id'])
        self.assertEqual(pedido.total, 300000.00)  # 100000 * 3
        self.assertEqual(pedido.detalles.count(), 1)

    def test_rechazo_por_stock_insuficiente(self):
        """Verifica que si se pide más de lo disponible, retorne 400 y no toque el stock."""
        payload = {
            'metodo_pago': 'TRANSFERENCIA',
            'direccion_envio': 'Bv. Roca 850',
            'detalles': [
                {'variante': self.variante.id, 'cantidad': 15}  # Hay 10 disponibles
            ],
        }
        res = self.client.post('/api/pedidos/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # El stock sigue intacto
        self.variante.refresh_from_db()
        self.assertEqual(self.variante.stock, 10)

    def test_accion_cancelar_pedido_restituye_stock(self):
        """Verifica la acción @action cancelar_pedido y la restitución automática de stock."""
        # 1. Crear pedido comprando 4 pares (quedan 6)
        payload = {
            'metodo_pago': 'TARJETA_DEBITO',
            'direccion_envio': 'Constitución 200',
            'detalles': [{'variante': self.variante.id, 'cantidad': 4}],
        }
        res_crear = self.client.post('/api/pedidos/', payload, format='json')
        self.variante.refresh_from_db()
        self.assertEqual(self.variante.stock, 6)

        pedido_id = res_crear.data['id']

        # 2. Cancelar el pedido invocando la @action
        res_cancel = self.client.post(f'/api/pedidos/{pedido_id}/cancelar_pedido/')
        self.assertEqual(res_cancel.status_code, status.HTTP_200_OK)

        # 3. Comprobar que el estado cambió a CANCELADO y el stock volvió a 10
        pedido = Pedido.objects.get(id=pedido_id)
        self.assertEqual(pedido.estado, Pedido.Estado.CANCELADO)
        self.variante.refresh_from_db()
        self.assertEqual(self.variante.stock, 10)

    def test_nested_serializer_en_listado_pedidos(self):
        """Verifica que GET /api/pedidos/ anide datos de usuario y detalles con SKU."""
        # Crear un pedido
        payload = {
            'metodo_pago': 'TARJETA_CREDITO',
            'direccion_envio': 'Av. Italia 1200',
            'detalles': [{'variante': self.variante.id, 'cantidad': 1}],
        }
        self.client.post('/api/pedidos/', payload, format='json')

        res = self.client.get('/api/pedidos/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        resultado = res.data['results'][0]

        # Comprobar NestedSerializer #2
        self.assertEqual(resultado['usuario']['username'], 'cliente_test')
        self.assertIn('detalles', resultado)
        self.assertEqual(resultado['detalles'][0]['sku'], 'VLX-TEST-42-NEO')

    def test_creacion_resena_y_restriccion_unica(self):
        """Verifica el alta de Resena y que no se dupliquen reseñas del mismo usuario al producto."""
        res = self.client.post(
            '/api/resenas/',
            {
                'producto': self.producto.id,
                'calificacion': 5,
                'comentario': 'Excelente retorno de energía en pasadas largas.',
            },
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Resena.objects.count(), 1)

        # Intentar crear otra reseña para el mismo producto -> Debe fallar por UniqueConstraint
        res_duplicada = self.client.post(
            '/api/resenas/',
            {
                'producto': self.producto.id,
                'calificacion': 4,
                'comentario': 'Otra opinión.',
            },
            format='json',
        )
        self.assertEqual(res_duplicada.status_code, status.HTTP_400_BAD_REQUEST)
