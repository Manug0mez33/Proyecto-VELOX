from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """Reutiliza el admin de usuarios de Django agregando rol y datos de contacto."""

    list_display = ["username", "email", "first_name", "last_name", "rol", "is_active"]
    list_filter = ["rol", "is_active", "is_staff"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["username"]
    fieldsets = UserAdmin.fieldsets + (("Datos VELOX", {"fields": ["rol", "telefono", "direccion", "ciudad"]}),)
    add_fieldsets = UserAdmin.add_fieldsets + (("Datos VELOX", {"fields": ["email", "rol"]}),)
