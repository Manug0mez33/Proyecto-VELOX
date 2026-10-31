from django.core.management import call_command
from django.core.management.base import BaseCommand

from apps.productos.models import Producto


class Command(BaseCommand):
    """
    Carga el fixture catalogo_velox solo si la base no tiene productos.
    Se ejecuta en cada arranque del servidor en Render: la primera vez llena el
    catálogo y las siguientes no pisa el stock ni los cambios hechos desde el admin.
    """

    help = "Carga el catálogo de prueba de VELOX si la base está vacía."

    def handle(self, *args, **options):
        if Producto.objects.exists():
            self.stdout.write("El catálogo ya tiene datos: no se carga el fixture.")
            return
        call_command("loaddata", "catalogo_velox")
        self.stdout.write(self.style.SUCCESS("Catálogo VELOX cargado."))
