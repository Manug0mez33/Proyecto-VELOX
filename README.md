# ⚡ VELOX — E-Commerce de Calzado Deportivo de Alto Rendimiento (EFI 2026)

Repositorio oficial del Examen Final Integrador (EFI 2026) — **ITEC Río Cuarto**:
- **Ingeniería de Software (Backend Django 6 + DRF)** — Prof. Facundo Lemo
- **Programación III (Frontend Next.js App Router)** — Prof. Valentino Arballo

## 👥 Integrantes del Equipo
- **Manuel Gómez** — Backend 1 (Core, Usuarios, Auth Dual JWT/Session, Pedidos, Reseñas y Deploy)
- **Valentino Cambria** — Backend 2 (Catálogo de 8 Modelos, Variantes SKU, ViewSets y Filtros)
- **Juan Falco** — Frontend 1 (UI Kit VELOX, Home, Catálogo, Ficha Dinámica y Autenticación JWT)
- **Tomás Benavidez** — Frontend 2 (CartContext, Schemas Zod, Checkout, Dashboard CRUD y Tests Vitest)

## 📂 Estructura del Monorepo
- `backend/`: API RESTful en Django + Django REST Framework gestionada con `uv` y Docker.
- `frontend/`: Aplicación web en Next.js 16 (App Router) + React 19 + Tailwind CSS v4.
- `docs/`: Documentación de arquitectura, manual de marca VELOX, plantillas de Figma y bitácora de defensa.

---

## ⚛️ Ejecución y Configuración del Frontend (`frontend/`)

### 1. Variables de Entorno
Copiar el archivo `.env.example` hacia `.env.local` dentro de `frontend/`:

```bash
cd frontend
cp .env.example .env.local
```

Variables requeridas:
- `NEXT_PUBLIC_API_URL=http://localhost:8000/api` (URL base del Backend en Django REST Framework).

### 2. Instalación y Servidor de Desarrollo
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### 3. Rutas y Componentes Implementados (Sprint 1 — `feature/front-setup-identidad`)
- **Rutas (R1):**
  - `/` (`src/app/page.jsx`): Landing Page y Hero Section con resplandor verde neón (`#39FF14`) y consumo de `GET /api/productos/destacados/` con fallback seguro.
  - `/tecnologia` (`src/app/tecnologia/page.jsx`): Manifiesto técnico e ingeniería biomecánica VELOX.
  - Estados globales App Router: `src/app/layout.jsx` (Layout raíz), `src/app/loading.jsx`, `src/app/error.jsx` y `src/app/not-found.jsx`.
- **Componentes Reutilizables Base (R2):**
  - `src/components/Navbar.jsx` (`Client Component`)
  - `src/components/Footer.jsx` (`Server Component`)
  - `src/components/Button.jsx` (`Client Component`)
  - `src/components/Badge.jsx` (`Server Component`)
  - `src/components/SkeletonCard.jsx` (`Server Component`)
## 🚀 Backend — Puesta en marcha local (`uv`)

Requisitos: Python 3.12+ y [`uv`](https://docs.astral.sh/uv/).

```bash
cd backend
uv sync                                   # crea .venv e instala dependencias desde uv.lock
cd src
uv run python manage.py migrate           # crea la base SQLite (db.sqlite3) con todas las tablas
uv run python manage.py loaddata catalogo_velox   # carga el catálogo de prueba
uv run python manage.py createsuperuser   # usuario para entrar a /admin/
uv run python manage.py runserver         # http://127.0.0.1:8000/admin/
```

**Estructura:** `backend/pyproject.toml` + `uv.lock`, proyecto Django en `backend/src/` (`manage.py`, configuración en `nucleo/`, apps en `apps/usuarios/` y `apps/productos/`).

**Variables de entorno** (opcionales en desarrollo, obligatorias en producción):

| Variable | Valor por defecto | Uso |
| :--- | :--- | :--- |
| `DJANGO_SECRET_KEY` | clave insegura de desarrollo | Clave criptográfica de Django |
| `DJANGO_DEBUG` | `True` | Modo debug |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Hosts permitidos (separados por coma) |

**Usuario personalizado:** `apps.usuarios.Usuario` hereda de `AbstractUser` y agrega `rol` (`ADMIN`, `EMPLEADO`, `CLIENTE`), `telefono`, `direccion` y `ciudad`; `email` es único. Está configurado como `AUTH_USER_MODEL` desde la primera migración.

## 🗂️ Backend — Catálogo e Inventario (`backend/src/apps/productos/`)

App Django con los **8 modelos del catálogo** (normalizados en 3FN) y su panel de administración:

| Modelo | Campos | Reglas de integridad |
| :--- | :--- | :--- |
| `Marca` | `nombre`, `origen`, `activo` | `nombre` único |
| `Categoria` | `nombre`, `descripcion`, `activo` | `nombre` único |
| `Proveedor` | `razon_social`, `cuit`, `email`, `telefono`, `activo` | `cuit` único con formato `XX-XXXXXXXX-X` |
| `Producto` | `marca`, `categoria`, `proveedor`, `nombre`, `descripcion`, `precio_base`, `genero`, `activo`, `creado_en` | FKs con `PROTECT`; `genero` ∈ `HOMBRE`/`MUJER`/`UNISEX` |
| `Talle` | `numero`, `sistema` | `(numero, sistema)` único; `sistema` ∈ `AR`/`US`/`EU`/`UK` |
| `Color` | `nombre`, `codigo_hex` | `nombre` único; hex `#RRGGBB` |
| `VarianteProducto` | `producto`, `talle`, `color`, `sku`, `stock`, `precio_ajustado`, `activo` | `sku` único; `(producto, talle, color)` único |
| `ImagenProducto` | `producto`, `url`, `es_portada`, `orden` | Máximo una portada por producto |

**Datos de prueba (seed):** `fixtures/catalogo_velox.json` carga 5 marcas, 5 categorías, 3 proveedores, 7 talles, 5 colores, 7 calzados, 58 variantes con SKU y 21 imágenes.

Panel de administración: `/admin/productos/` (los productos permiten cargar variantes e imágenes en la misma ficha; el stock de cada SKU se edita directamente desde el listado de variantes).


## 🔐 Backend — Autenticación Dual, Docker y Endpoints de Usuarios (Card #17)

### Ejecución con Docker y Docker Compose
```bash
docker compose up --build
```

### Endpoints Incorporados (`apps/usuarios` y Núcleo DRF)

| Método | Endpoint | Descripción | Permiso |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Vista HTML tradicional de bienvenida de **VELOX CORE API** | Público |
| `GET` | `/api/docs/` | Documentación interactiva **Swagger UI** (`drf-spectacular`) | Público |
| `GET` | `/api/redoc/` | Documentación técnica **ReDoc** (OpenAPI 3.0) | Público |
| `POST` | `/api/token/` | Emisión de tokens JWT (`access` y `refresh`) con `SimpleJWT` | Público |
| `POST` | `/api/token/refresh/` | Renovación de token de acceso JWT | Público |
| `POST` | `/api/usuarios/` | Registro público de clientes (`rol="CLIENTE"` por defecto) | Público (`AllowAny`) |
| `GET` | `/api/usuarios/` | Listado paginado de usuarios (filtros por `rol`, `ciudad`, `search`) | Autenticado (`ADMIN`/`EMPLEADO` ven todos; `CLIENTE` ve el propio) |
| `GET / PATCH` | `/api/usuarios/perfil/` | Consulta o edición rápida del perfil del usuario autenticado | Autenticado (JWT / Sesión) |
| `GET / PUT / PATCH / DELETE` | `/api/usuarios/{id}/` | Detalle, actualización y baja de cuenta de usuario | Propietario o `ADMIN` |
