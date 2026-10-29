# Reglas Generales de Flujo de Trabajo y Documentación Viva (EFI 2026 - VELOX)

Este documento define las reglas transversales de coordinación de equipo, flujo de ramas en Git, trazabilidad en código y documentación viva obligatoria tanto para el **Backend (Django + DRF)** como para el **Frontend (Next.js App Router)**.

---

## 1. Regla de Documentación Viva (Innegociable)

Ninguna tarea, rama `feature/*` ni Pull Request puede cerrarse sin actualizar en el mismo cambio:

1. **El `README.md` del proyecto:**
   - Instrucciones de instalación y ejecución actualizadas (`uv`, Docker, `npm`).
   - Variables de entorno requeridas (`.env.example`).
   - Nuevos endpoints de la API REST o rutas de Next.js incorporadas.
   - Evidencias o capturas de prueba del funcionamiento.
2. **La bitácora cronológica y guía de defensa oral en `docs/bitacora_defensa.md`:**
   - Qué se implementó y qué archivos se tocaron.
   - Por qué se diseñó de esa manera y qué problemas técnicos se resolvieron.
   - Cómo debe explicarlo y defenderlo oralmente el equipo ante los docentes **Facundo Lemo** (Ingeniería de Software / Backend) y **Valentino Arballo** (Programación III / Frontend).

---

## 2. Trazabilidad en Código para la Defensa Oral

Cada archivo clave debe incluir justificación técnica concisa para que los 4 integrantes puedan defender cualquier parte del sistema:

- **En Next.js (Frontend):**
  - Comentario inicial de 1 línea en cada archivo de componente o página justificando explícitamente si es **Server Component** (ej. SEO, fetching directo en servidor, cero JS de hidratación) o **Client Component (`"use client"`)** (ej. uso de hooks `useState`/`useContext`, eventos `onClick`, formularios interactivos con React Hook Form).
- **En Django DRF (Backend):**
  - Docstring conciso en cada `ViewSet`, `Serializer` y clase de permiso (`BasePermission`) explicando su rol (ej. sobrecarga de `get_serializer_class()` para usar `NestedSerializer` en la acción `list`, propósito de cada `@action`, filtros `django-filter` y restricción por `rol`).

---

## 3. GitFlow Unificado y Coordinación de Equipo (4 Integrantes)

- **Estructura de Ramas:**
  - `main`: Versión estable de entrega y producción.
  - `develop`: Rama de integración continua donde convergen las entregas del equipo.
  - `feature/<area>-<descripcion>`: Ramas de nuevas funcionalidades creadas desde `develop` (ej. `feature/back-modelos-catalogo`, `feature/front-carrito-context`).
  - `fix/<area>-<descripcion>`: Ramas de corrección de errores puntuales creadas desde `develop`.
- **Protección y Revisión:**
  - **Prohibido hacer push directo a `main` o `develop`.**
  - Todo cambio ingresa a `develop` mediante un **Pull Request (PR)** revisado por al menos otro integrante del grupo y vinculado a una tarjeta asignada en el tablero Kanban (**GitHub Projects** o **Trello**).
  - Uso obligatorio de **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
