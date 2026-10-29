# Reglas de Desarrollo del Proyecto (EFI 2026 - Ingeniería de Software)

Este documento define las reglas de ingeniería, diseño, calidad de código y flujo de trabajo para cualquier desarrollador o agente de IA que trabaje en este repositorio.

---

## 1. Filosofía de Desarrollo: Simplicidad y Legibilidad (KISS)
- **El código se defiende oralmente:** Cada línea de código debe poder ser explicada con claridad y soltura ante el docente evaluador.
- **Prohibida la sobre-ingeniería:** No se agregan patrones innecesarios, microservicios, capas abstractas ni herramientas no solicitadas. 
- **Stack cerrado y alineado al repositorio de referencia (`drf-2026`):**
  - Python 3.12+ gestionado con `uv`.
  - Django 6.x y `djangorestframework`.
  - Autenticación: `djangorestframework-simplejwt` (JWT para frontend) y autenticación por sesión de Django (para panel y browsable API).
  - Documentación: `drf-spectacular` (Swagger / OpenAPI 3).
  - Filtros: `django-filter`.
  - CORS: `django-cors-headers`.
  - Despliegue: Docker y Docker Compose.
  - **No incorporar ninguna otra dependencia externa sin aprobación explícita.**

---

## 2. Requisitos Técnicos Obligatorios (Innegociables de Consigna)

Cualquier cambio o desarrollo debe alinearse estrictamente a estos puntos:

1. **Modelos de Base de Datos (Mínimo 10 - Acordados 12):**
   - Definidos en `docs/backend/arquitectura_y_dominio.md`: `Marca`, `Categoria`, `Proveedor`, `Producto`, `Talle`, `Color`, `VarianteProducto`, `ImagenProducto`, `Usuario`, `Pedido`, `DetallePedido`, `Resena`.
   - `Usuario` es un Custom User Model (`AbstractUser`) con campo `rol` (`ADMIN`, `EMPLEADO`, `CLIENTE`).
   - Respetar normalización relacional: variantes físicas independientes (talle + color + SKU único + stock).
2. **API REST con DRF:**
   - Al menos 8 ViewSets registrados en routers de DRF.
   - Paginación estándar (`PageNumberPagination`) en todas las consultas de listado (`get all`).
   - Al menos 1 ViewSet con filtros y búsquedas (`ProductoViewSet` con `django-filter`).
   - Al menos 2 ViewSets con `NestedSerializers` en el método `list`:
     - `ProductoViewSet`: debe mostrar datos anidados de marca, categoría, galería de fotos y variantes.
     - `PedidoViewSet`: debe anidar los datos del usuario comprador y la lista de items comprados.
   - Al menos 2 acciones personalizadas con el decorador `@action`:
     - `ProductoViewSet`: `@action(detail=False, methods=['get'])` `destacados` y `@action(detail=True, methods=['get'])` `stock_por_talle`.
     - `PedidoViewSet`: `@action(detail=True, methods=['post'])` `cancelar_pedido`.
   - Documentación servida en `/api/docs/` (Swagger UI y schema OpenAPI).
   - API navegable habilitada.
3. **Vistas Tradicionales y Panel de Administración:**
   - Vista principal en la raíz (`/`) que renderice un template HTML de bienvenida (no requiere formularios CRUD).
   - Panel de administración (`admin.py`) completamente configurado para los modelos principales con `list_display`, `list_filter`, `search_fields` y `ordering`.
4. **Seguridad y CORS:**
   - Endpoints sensibles protegidos con permisos de DRF según el rol del usuario autenticado.
   - CORS configurado adecuadamente para admitir el futuro frontend en Next.js.

---

## 3. Estructura y Estándares de Código

- **Estructura idéntica al repositorio guía:**
  ```text
  ├── pyproject.toml
  ├── uv.lock
  ├── Dockerfile
  ├── docker-compose.yml
  ├── docs/
  └── src/
      ├── manage.py
      ├── nucleo/ (o settings/)
      │   ├── settings.py
      │   ├── urls.py
      │   └── routers.py
      └── apps/ (o módulos por dominio)
          ├── productos/
          ├── usuarios/
          └── pedidos/
  ```
- **Claridad de código:**
  - Código limpio, legible y con comentarios cortos pero claros.
  - Nombrado claro y representativo en español para coincidir con la temática y el repo guía.
  - Serializadores separados por responsabilidad: serializador estándar para CRUD vs. serializador con `NestedSerializer` para `list`.

---

## 4. Flujo de Trabajo en Git y Documentación

- **GitFlow unificado y ramas protegidas (`main` y `develop`):**
  - `main`: Rama estable de entrega y producción.
  - `develop`: Rama de integración continua del equipo.
  - Todo cambio nace de `develop` en una rama específica: `feature/<nombre-modulo>` o `fix/<descripcion>`.
  - Prohibido pushear directo a `main` o `develop`; la integración se realiza exclusivamente mediante **Pull Requests (PR)** revisados y documentados.
- **Commits descriptivos (Conventional Commits):**
  - Formato: `tipo(alcance): descripción breve en presente`.
  - Ejemplos: `feat(productos): agregar modelos Producto y Variante con SKU`, `fix(auth): corregir permisos en cancelacion de pedidos`.
- **Documentación viva y registro de evidencias (Obligatorio en cada PR):**
  - Cada PR debe actualizar tanto el `README.md` (instrucciones, variables de entorno, endpoints y capturas de prueba) como `docs/bitacora_defensa.md` (decisiones técnicas, qué hizo cada integrante y argumentos para la defensa oral).
