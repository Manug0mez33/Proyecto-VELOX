# Reglas Generales de Flujo de Trabajo y Documentación Viva (Equipo VELOX)

Este documento establece el acuerdo de trabajo para los **4 integrantes del equipo** y los asistentes de IA durante el desarrollo del EFI 2026 (**Ingeniería de Software II** y **Programación III**).

---

## 1. Regla de Documentación Viva (Innegociable)

Ninguna tarea del tablero, rama `feature/*` ni Pull Request puede darse por terminada sin actualizar **en el mismo PR**:

1. **El `README.md` del repositorio correspondiente:**
   - Pasos de instalación, comandos de ejecución y variables de entorno.
   - Listado actualizado de endpoints (Backend) o rutas/páginas (Frontend).
   - Capturas de pantalla o salidas de terminal que demuestren que la funcionalidad anda.
2. **La Bitácora y Guía de Defensa Oral (`docs/bitacora_defensa.md`):**
   - Registro cronológico de qué se construyó en la etapa/PR y quiénes participaron.
   - Por qué se tomó cada decisión técnica y qué problema resolvió.
   - Argumentos clave para responder las preguntas de defensa oral ante los profesores **Facundo Lemo** (proceso paso a paso y backend DRF) y **Valentino Arballo** (decisiones de arquitectura y componentes en Next.js).

---

## 2. Trazabilidad en Código para la Defensa Oral

Para que cualquier integrante del grupo pueda explicar el código en el coloquio final sin dudar:

- **En Next.js (Frontend):**
  - Colocar un comentario de 1 línea al inicio de cada componente indicando si es **Server Component** o **Client Component (`"use client"`)** y por qué (ej. `// Client Component ("use client"): requiere estado local y eventos onClick para seleccionar talle y agregar a CartContext`).
- **En Django DRF (Backend):**
  - Colocar un docstring breve en cada `ViewSet`, `Serializer` y permiso explicando su responsabilidad (ej. cambio dinámico a `NestedSerializer` en `list`, uso del decorador `@action`, reglas de negocio al cancelar un pedido o filtros con `django-filter`).

---

## 3. GitFlow Unificado y Coordinación de Equipo (4 Integrantes)

- **Ramas del Repositorio:**
  - `main`: Versión estable lista para entrega final y despliegue en producción.
  - `develop`: Rama de integración continua del equipo.
  - `feature/<area>-<descripcion>`: Ramas de trabajo diario que nacen desde `develop` (ej. `feature/back-pedidos-viewset`, `feature/front-catalogo-filtros`).
  - `fix/<area>-<descripcion>`: Ramas para corregir bugs detectados en integración.
- **Reglas de Integración y Tablero Kanban:**
  - **Prohibido hacer push directo a `main` o `develop`.**
  - Todo cambio se integra mediante **Pull Request (PR)** hacia `develop`, revisado por al menos un compañero y vinculado a su tarea correspondiente en el tablero Kanban (**GitHub Projects** o **Trello**).
  - Todos los commits siguen **Conventional Commits** (`feat(alcance): ...`, `fix(alcance): ...`, `docs(alcance): ...`, `test(alcance): ...`).
