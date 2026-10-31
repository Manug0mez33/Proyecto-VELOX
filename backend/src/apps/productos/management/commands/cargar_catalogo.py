from django.core.management import call_command
from django.core.management.base import BaseCommand

from apps.productos.models import Producto
from apps.usuarios.models import Usuario


class Command(BaseCommand):
    """
    Carga el fixture catalogo_velox solo si la base no tiene productos.
    Se ejecuta en cada arranque del servidor en Render: la primera vez llena el
    catálogo y las siguientes no pisa el stock ni los cambios hechos desde el admin.
    Garantiza además la existencia del usuario de demostración 'cliente1'.
    """

    help = "Carga el catálogo de prueba de VELOX y el usuario cliente1."

    def handle(self, *args, **options):
        # 1. Asegurar usuario cliente1 para pruebas y accesos de cliente
        usuario, creado = Usuario.objects.get_or_create(
            username="cliente1",
            defaults={
                "email": "cliente1@velox.com.ar",
                "first_name": "Cliente",
                "last_name": "Velox",
                "rol": Usuario.Rol.CLIENTE,
            },
        )
        if creado or not usuario.check_password("cliente1234"):
            usuario.set_password("cliente1234")
            usuario.rol = Usuario.Rol.CLIENTE
            usuario.save()
            self.stdout.write(self.style.SUCCESS("Usuario 'cliente1' configurado con éxito."))

        # 2. Catálogo de productos
        if Producto.objects.exists():
            self.stdout.write("El catálogo ya tiene datos: no se carga el fixture.")
            return
        call_command("loaddata", "catalogo_velox")
        self.stdout.write(self.style.SUCCESS("Catálogo VELOX cargado."))
