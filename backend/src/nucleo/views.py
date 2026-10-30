"""
Vista tradicional de bienvenida en la raíz ('/') del servidor Backend de VELOX.
Cumple con el requisito obligatorio de renderizar un template HTML en la ruta principal.
"""
from django.shortcuts import render


def inicio_velox(request):
    """Renderiza la portada institucional del Backend API de VELOX con accesos rápidos."""
    contexto = {
        'proyecto': 'VELOX — Calzado Deportivo de Alto Rendimiento',
        'materia': 'Ingeniería de Software & Programación III (EFI 2026 - ITEC Río Cuarto)',
        'version': '1.0.0',
    }
    return render(request, 'inicio.html', contexto)
