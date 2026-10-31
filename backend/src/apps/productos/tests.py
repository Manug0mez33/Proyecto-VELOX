"""
Tests de integración de la API de Catálogo: NestedSerializer, filtros, @action y permisos por rol.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.productos.models import (
    Categoria,
    Color,
    ImagenProducto,
    Marca,
    Producto,
    Proveedor,
    Talle,
    VarianteProducto,
)

Usuario = get_user_model()


class CatalogoApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cliente = Usuario.objects.create_user(
            username="cliente", email="cliente@test.com", password="Password123!", rol=Usuario.Rol.CLIENTE
        )
        self.empleado = Usuario.objects.create_user(
            username="empleado", email="empleado@test.com", password="Password123!", rol=Usuario.Rol.EMPLEADO
        )

        self.nike = Marca.objects.create(nombre="Nike")
        self.adidas = Marca.objects.create(nombre="Adidas")
        self.running = Categoria.objects.create(nombre="Running")
        self.proveedor = Proveedor.objects.create(
            razon_social="Proveedor Test S.A.", cuit="30-71548963-9", email="proveedor@test.com"
        )
        self.t41 = Talle.objects.create(numero="41.0")
        self.t42 = Talle.objects.create(numero="42.0")
        self.negro = Color.objects.create(nombre="Negro", codigo_hex="#000000")
        self.blanco = Color.objects.create(nombre="Blanco", codigo_hex="#FFFFFF")

        self.pegasus = Producto.objects.create(
            marca=self.nike, categoria=self.running, proveedor=self.proveedor,
            nombre="Pegasus 40", precio_base="190000.00", genero=Producto.Genero.UNISEX,
        )
        self.ultraboost = Producto.objects.create(
            marca=self.adidas, categoria=self.running, proveedor=self.proveedor,
            nombre="Ultraboost", precio_base="230000.00", genero=Producto.Genero.HOMBRE,
        )
        VarianteProducto.objects.create(producto=self.pegasus, talle=self.t41, color=self.negro, sku="NK-41-NEG", stock=3)
        VarianteProducto.objects.create(producto=self.pegasus, talle=self.t41, color=self.blanco, sku="NK-41-BLA", stock=2)
        VarianteProducto.objects.create(producto=self.pegasus, talle=self.t42, color=self.negro, sku="NK-42-NEG", stock=5)
        # Variante inactiva: no debe sumar stock ni aparecer anidada.
        VarianteProducto.objects.create(
            producto=self.pegasus, talle=self.t42, color=self.blanco, sku="NK-42-BLA", stock=99, activo=False
        )
        # Ultraboost sin stock: no debe aparecer en destacados.
        VarianteProducto.objects.create(producto=self.ultraboost, talle=self.t42, color=self.negro, sku="AD-42-NEG", stock=0)
        ImagenProducto.objects.create(producto=self.pegasus, url="https://img.test/lateral.jpg", orden=1)
        ImagenProducto.objects.create(producto=self.pegasus, url="https://img.test/portada.jpg", es_portada=True, orden=0)

    def test_list_paginado_con_nested_serializer(self):
        """El listado es público, paginado y anida marca, categoría, imágenes y variantes activas."""
        # 4 consultas fijas (count, productos, imágenes, variantes): sin N+1 aunque haya más productos.
        with self.assertNumQueries(4):
            response = self.client.get("/api/productos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

        pegasus = next(p for p in response.data["results"] if p["id"] == self.pegasus.id)
        self.assertEqual(pegasus["marca"]["nombre"], "Nike")
        self.assertEqual(pegasus["categoria"]["nombre"], "Running")
        self.assertEqual(pegasus["imagen_portada"], "https://img.test/portada.jpg")
        self.assertEqual(len(pegasus["imagenes"]), 2)
        self.assertEqual(len(pegasus["variantes"]), 3)
        self.assertEqual(pegasus["stock_total"], 10)

    def test_filtros_y_busqueda(self):
        """django-filter por marca, género y rango de precio; SearchFilter por nombre."""
        def ids(query):
            return [p["id"] for p in self.client.get(f"/api/productos/?{query}").data["results"]]

        self.assertEqual(ids(f"marca={self.adidas.id}"), [self.ultraboost.id])
        self.assertEqual(ids("genero=UNISEX"), [self.pegasus.id])
        self.assertEqual(ids("precio_min=200000"), [self.ultraboost.id])
        self.assertEqual(ids("precio_max=200000"), [self.pegasus.id])
        self.assertEqual(ids("search=pegasus"), [self.pegasus.id])

    def test_action_destacados(self):
        """Solo devuelve productos activos con stock disponible."""
        response = self.client.get("/api/productos/destacados/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([p["id"] for p in response.data], [self.pegasus.id])

    def test_action_stock_por_talle(self):
        """Agrupa el stock por talle, sin contar variantes inactivas."""
        response = self.client.get(f"/api/productos/{self.pegasus.id}/stock_por_talle/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        talles = {t["talle"]: t for t in response.data["talles"]}
        self.assertEqual(talles["41 AR"]["stock_total"], 5)
        self.assertEqual(len(talles["41 AR"]["colores"]), 2)
        self.assertEqual(talles["42 AR"]["stock_total"], 5)

    def test_escritura_restringida_al_personal(self):
        """Un CLIENTE no puede crear productos; un EMPLEADO sí, enviando IDs de las relaciones."""
        payload = {
            "marca": self.nike.id,
            "categoria": self.running.id,
            "proveedor": self.proveedor.id,
            "nombre": "Vomero 17",
            "precio_base": "210000.00",
            "genero": "MUJER",
        }
        self.client.force_authenticate(self.cliente)
        self.assertEqual(self.client.post("/api/productos/", payload).status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(self.empleado)
        response = self.client.post("/api/productos/", payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["marca"], self.nike.id)

    def test_variante_por_sku(self):
        """Las variantes se consultan y actualizan por SKU."""
        response = self.client.get("/api/variantes/NK-41-NEG/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["precio_final"], "190000.00")

        self.client.force_authenticate(self.empleado)
        response = self.client.patch("/api/variantes/NK-41-NEG/", {"stock": 20})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(VarianteProducto.objects.get(sku="NK-41-NEG").stock, 20)

    def test_proveedores_solo_personal(self):
        """Los proveedores no son públicos ni visibles para clientes."""
        self.assertIn(self.client.get("/api/proveedores/").status_code, [401, 403])
        self.client.force_authenticate(self.cliente)
        self.assertEqual(self.client.get("/api/proveedores/").status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.empleado)
        self.assertEqual(self.client.get("/api/proveedores/").status_code, status.HTTP_200_OK)

    def test_paginacion_de_6_por_pagina(self):
        """El catálogo pagina de a 6 y acepta ?page_size= (el dashboard pide más)."""
        for i in range(5):
            Producto.objects.create(
                marca=self.nike, categoria=self.running, proveedor=self.proveedor,
                nombre=f"Extra {i}", precio_base="1000.00",
            )
        primera = self.client.get("/api/productos/").data
        self.assertEqual(primera["count"], 7)
        self.assertEqual(len(primera["results"]), 6)
        self.assertIsNotNone(primera["next"])
        self.assertEqual(len(self.client.get("/api/productos/?page=2").data["results"]), 1)
        self.assertEqual(len(self.client.get("/api/productos/?page_size=100").data["results"]), 7)

    def test_filtro_sku_no_duplica_stock(self):
        """?sku= filtra por variantes sin multiplicar el stock_total anotado."""
        response = self.client.get("/api/productos/?sku=NK-4")
        self.assertEqual([p["id"] for p in response.data["results"]], [self.pegasus.id])
        self.assertEqual(response.data["results"][0]["stock_total"], 10)

    def test_borrar_variante_con_pedidos_responde_409(self):
        """Una variante que figura en pedidos no se borra (PROTECT) y la API explica por qué."""
        from apps.pedidos.models import DetallePedido, Pedido

        variante = VarianteProducto.objects.get(sku="NK-41-NEG")
        pedido = Pedido.objects.create(usuario=self.cliente, total=190000)
        DetallePedido.objects.create(pedido=pedido, variante=variante, cantidad=1, precio_unitario=190000, subtotal=190000)

        self.client.force_authenticate(self.empleado)
        response = self.client.delete("/api/variantes/NK-41-NEG/")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("1 detalle de pedido", response.data["detail"])
        self.assertTrue(VarianteProducto.objects.filter(sku="NK-41-NEG").exists())

    def test_borrar_marca_con_productos_responde_409(self):
        """El mismo manejo aplica a cualquier borrado protegido, por ejemplo una marca con productos."""
        self.client.force_authenticate(self.empleado)
        response = self.client.delete(f"/api/marcas/{self.nike.id}/")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("producto", response.data["detail"])
