"""
Clases de paginación de la API VELOX (PageNumberPagination de DRF).
"""
from rest_framework.pagination import PageNumberPagination


class PaginacionVelox(PageNumberPagination):
    """
    Paginación global: 10 resultados por página. El cliente puede pedir otro tamaño
    con ?page_size=N (máximo 100), por ejemplo el dashboard para ver todo el inventario.
    """

    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class PaginacionCatalogo(PaginacionVelox):
    """Catálogo de productos: 6 calzados por página (grilla de 3 x 2 en el frontend)."""

    page_size = 6
