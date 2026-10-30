"""
Tests automatizados para el módulo de Usuarios, Autenticación Dual JWT y Vista Raíz ('/').
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.usuarios.models import Usuario


class UsuariosYAuthTests(TestCase):
    """Pruebas de integración para el registro de clientes, emisión de JWT y vista de bienvenida."""

    def setUp(self):
        self.client = APIClient()
        self.datos_registro = {
            'username': 'atleta_velox',
            'email': 'atleta@velox.com.ar',
            'password': 'PasswordSegura2026!',
            'first_name': 'Manuel',
            'last_name': 'Gómez',
            'telefono': '+54 358 4123456',
            'direccion': 'Av. España 450',
            'ciudad': 'Río Cuarto',
        }

    def test_vista_bienvenida_raiz_html(self):
        """Verifica que la ruta raíz ('/') renderice el template HTML de bienvenida (200 OK)."""
        respuesta = self.client.get(reverse('inicio'))
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertContains(respuesta, 'VELO<span>X</span> CORE API')

    def test_registro_publico_asigna_rol_cliente_y_encripta_password(self):
        """Verifica que POST /api/usuarios/ cree un usuario CLIENTE con contraseña hasheada."""
        respuesta = self.client.post('/api/usuarios/', self.datos_registro, format='json')
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        usuario = Usuario.objects.get(username='atleta_velox')
        self.assertEqual(usuario.rol, Usuario.Rol.CLIENTE)
        self.assertTrue(usuario.check_password('PasswordSegura2026!'))

    def test_obtencion_token_jwt_y_consulta_perfil(self):
        """Verifica el flujo completo de SimpleJWT (POST /api/token/) y GET /api/usuarios/perfil/."""
        self.client.post('/api/usuarios/', self.datos_registro, format='json')
        res_token = self.client.post(
            '/api/token/',
            {'username': 'atleta_velox', 'password': 'PasswordSegura2026!'},
            format='json',
        )
        self.assertEqual(res_token.status_code, status.HTTP_200_OK)
        self.assertIn('access', res_token.data)
        self.assertIn('refresh', res_token.data)

        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + res_token.data['access'])
        res_perfil = self.client.get('/api/usuarios/perfil/')
        self.assertEqual(res_perfil.status_code, status.HTTP_200_OK)
        self.assertEqual(res_perfil.data['email'], 'atleta@velox.com.ar')
