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
