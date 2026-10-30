# Bitácora de Desarrollo y Guía de Defensa Oral — Proyecto VELOX (EFI 2026)

**Institución:** Instituto Tecnológico Río Cuarto (ITEC)  
**Espacios Curriculares:**  
- **Ingeniería de Software (Backend — Django + DRF):** Prof. Facundo Lemo  
- **Programación III (Frontend — Next.js App Router):** Prof. Valentino Arballo  

---

## Propósito de este Documento

Este archivo es la **memoria técnica viva y guía de estudio del equipo de 4 integrantes** para el coloquio y defensa oral del Examen Final Integrador (EFI 2026). Cumple dos objetivos centrales exigidos por ambas cátedras:

1. **Ante el Prof. Facundo Lemo (Ingeniería de Software / Backend):** Permitir a cualquier integrante relatar **paso a paso el proceso de ingeniería**, cómo evolucionó el dominio de **VELOX**, cómo se dividieron las tareas en GitFlow (`main`, `develop`, `feature/*`), qué problemas surgieron en cada iteración y por qué se modelaron así las entidades y endpoints en Django REST Framework.
2. **Ante el Prof. Valentino Arballo (Programación III / Frontend):** Fundamentar con precisión técnica **cada decisión de arquitectura en Next.js**, incluyendo por qué cada componente es un *Server Component* o un *Client Component* (`"use client"`), cómo operan las *Server Actions* con cookies HTTP-Only para JWT, cómo se completan las 4 operaciones CRUD y cómo se valida con React Hook Form + Zod y Vitest.

> [!IMPORTANT]
> **Regla de Oro del Equipo:** Ningún Pull Request hacia `develop` se aprueba sin haber registrado su entrada cronológica en la **Sección 1** y actualizado las matrices de defensa en las **Secciones 2 y 3**.

---

## 1. Cronología del Proceso de Desarrollo

### Etapa 0: Planificación, Diseño de Dominio VELOX y Reglas de Ingeniería
- **Fecha:** Octubre 2026
- **Integrantes participantes:** Equipo completo (4 integrantes)
- **Archivos creados/modificados:**
  - `docs/backend/arquitectura_y_dominio.md`
  - `docs/backend/reglas_de_desarrollo.md`
  - `docs/frontend/arquitectura_y_reglas_frontend.md`
  - `docs/frontend/identidad_de_marca_velox.md`
  - `docs/reglas_generales_y_flujo.md`
  - `.agents/rules/backend_rules.md`, `.agents/rules/frontend_rules.md`, `.agents/rules/workflow_and_docs_rules.md`, `.agents/rules/api_contract_rules.md`
  - `.agents/skills/documentar-avance/SKILL.md`, `.agents/skills/auditar-consigna-efi/SKILL.md`
- **Qué se hizo:**
  - Se definió la identidad del proyecto **VELOX** (e-commerce y gestión de calzado deportivo de alto rendimiento) con estética Dark Mode nativo (`#121212`, `#2A2A2A` y acento verde neón `#39FF14`).
  - Se diseñó el modelo relacional de **12 modelos** (superando el mínimo de 10 de la consigna) separando el calzado conceptual (`Producto`) del inventario físico real (`VarianteProducto` con talle, color, SKU único y stock).
  - Se establecieron los contratos entre Backend y Frontend: paridad `snake_case`, sobre de paginación DRF (`{ count, next, previous, results }`), cobertura obligatoria de las 4 operaciones CRUD (`GET`, `POST`, `PUT/PATCH`, `DELETE`) y flujo GitFlow con ramas `main`, `develop` y `feature/*`.
- **Por qué se diseñó así (Justificación para la Defensa):**
  - En una tienda real de calzado, el stock nunca está en el modelo genérico "Zapatilla Velox Carbon", sino en la combinación exacta de **Talle + Color (`VarianteProducto`)** identificada por un código **SKU**. Esto evita anomalías de actualización y demuestra normalización en 3FN ante la cátedra de Ingeniería de Software.
  - En el Frontend se descartaron librerías pesadas (MUI, Shadcn, Redux) para cumplir estrictamente la filosofía de Programación III: Tailwind CSS puro, Context API nativa (`CartContext`), Server Actions y JWT en cookies HTTP-Only.

---

### Etapa 1 (Sprint 1 — Frontend Parte 1): Setup Next.js App Router, Tokens Dark Mode VELOX, Layout Raíz (R1), Componentes Base (R2) y Vistas `/` y `/tecnologia`
- **Fecha:** 29 de Octubre de 2026
- **Rama:** `feature/front-setup-identidad` -> `develop`
- **Responsable(s):** Juan Falco (Frontend 1)
- **Archivos clave:**
  - `frontend/package.json`, `frontend/next.config.mjs`, `frontend/postcss.config.mjs`, `frontend/.env.example`
  - `frontend/src/app/globals.css`, `frontend/src/app/layout.jsx`, `frontend/src/app/loading.jsx`, `frontend/src/app/error.jsx`, `frontend/src/app/not-found.jsx`
  - `frontend/src/app/page.jsx`, `frontend/src/app/tecnologia/page.jsx`
  - `frontend/src/components/Navbar.jsx`, `Footer.jsx`, `Button.jsx`, `Badge.jsx`, `SkeletonCard.jsx`
- **Qué se implementó:**
  - Se inicializó la aplicación Frontend en `frontend/` con Next.js 16 (App Router), React 19 y Tailwind CSS v4 puro (sin librerías de UI externas).
  - Se configuraron los tokens cromáticos del Manual de Identidad Visual VELOX en `src/app/globals.css` (`#121212` Base, `#2A2A2A` Surface, `#39FF14` Accent, `#FFFFFF` y `#D1D5DB` Text) y las fuentes de Google Fonts `Space Grotesk` e `Inter` en `src/app/layout.jsx`.
  - Se implementaron los archivos de estado del App Router exigidos por R1 (`loading.jsx`, `error.jsx`, `not-found.jsx`) y los primeros 5 componentes reutilizables de R2 (`Navbar`, `Footer`, `Button`, `Badge`, `SkeletonCard`), cada uno con su comentario superior de 1 línea justificando Server vs. Client Component.
  - Se maquetaron las páginas `/` (Hero de la *VELOX Hyperion Carbon X* con glow neón y sección *Destacados de la Semana* conectada a `GET /api/productos/destacados/`) y `/tecnologia` (Manifiesto de ingeniería).
- **Decisiones técnicas y problemas resueltos:**
  - Para permitir el desarrollo paralelo sin bloqueo mientras el equipo de Backend finaliza los endpoints, `getProductosDestacados()` en `src/app/page.jsx` consume `process.env.NEXT_PUBLIC_API_URL` soportando tanto array directo como el sobre paginado DRF (`.results`) e incluye un fallback estructurado en `snake_case` (`precio_base`, `marca_detalle`, `categoria_detalle`, `stock_total`).
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** Se respetó desde el inicio el contrato `snake_case` y la separación conceptual entre `Producto` y `VarianteProducto` (SKU y talles AR) en las tarjetas de destacados.
  - **Para Valentino Arballo (Componentes / Frontend):** `layout.jsx`, `page.jsx`, `tecnologia/page.jsx`, `Footer.jsx`, `Badge.jsx` y `SkeletonCard.jsx` son **Server Components** para optimizar SEO y enviar cero JS innecesario al cliente; solo `Navbar.jsx`, `Button.jsx` y `error.jsx` usan `"use client"` porque requieren hooks (`usePathname`, `useState`, `useEffect`) o eventos `onClick`/`reset()`.
### Etapa 1 / PR: Proyecto Django base + Modelos de Catálogo e Inventario + Admin
- **Rama:** `feature/back-modelos-catalogo` -> `develop`
- **Responsable(s):** Valentino Cambria (Backend 2)
- **Archivos clave:**
  - `backend/pyproject.toml`, `backend/uv.lock`, `backend/.python-version` (proyecto inicializado con `uv`)
  - `backend/src/manage.py`, `backend/src/nucleo/settings.py` (apps registradas, `AUTH_USER_MODEL`, idioma `es-ar`, zona horaria Córdoba, secretos por variable de entorno)
  - `backend/src/apps/usuarios/models.py`, `admin.py`, `migrations/0001_initial.py` (Custom User `Usuario`)
  - `backend/src/apps/productos/models.py` (8 modelos)
  - `backend/src/apps/productos/admin.py` (panel configurado con inlines)
  - `backend/src/apps/productos/apps.py`, `backend/src/apps/productos/migrations/0001_initial.py`
  - `backend/src/apps/productos/fixtures/catalogo_velox.json` (seed de pruebas)
  - `README.md`, `docs/bitacora_defensa.md`
- **Qué se implementó:**
  - Proyecto Django 6.1 inicializado con `uv` (`uv init` + `uv add django` + `startproject nucleo`), con la estructura `backend/src/{manage.py, nucleo/, apps/}` del repositorio guía.
  - `Usuario(AbstractUser)` con `rol`, `telefono`, `direccion`, `ciudad` y `email` único, registrado como `AUTH_USER_MODEL`. Se creó en esta etapa porque Django exige definir el usuario personalizado **antes de la primera migración**: cambiarlo después obliga a borrar la base y las migraciones.
  - Modelos `Marca`, `Categoria`, `Proveedor`, `Producto`, `Talle`, `Color`, `VarianteProducto` e `ImagenProducto` con sus relaciones `ForeignKey`, respetando el diagrama ER de `docs/backend/arquitectura_y_dominio.md`.
  - `admin.py` con `list_display`, `list_filter`, `search_fields` y `ordering` en los 8 modelos; `ProductoAdmin` carga variantes e imágenes en la misma ficha (`TabularInline`) y `VarianteProductoAdmin` permite editar el stock desde el listado (`list_editable`).
  - Fixture `catalogo_velox` con 7 calzados, 58 variantes con SKU (formato `MARCA-MODELO-TALLE-COLOR`, ej. `NK-PEG40-41-NEG`), algunas con stock 0 y precio ajustado para probar casos borde.
- **Decisiones técnicas y problemas resueltos:**
  - **Integridad en la base de datos, no solo en el código:** `sku` es `unique=True`, y un `UniqueConstraint(producto, talle, color)` impide cargar la misma variante física dos veces con SKUs distintos. `Talle` es único por `(numero, sistema)`.
  - **`on_delete` elegido por relación:** `PROTECT` en `Marca`/`Categoria`/`Proveedor` → `Producto` y en `Talle`/`Color` → `VarianteProducto` (no se pierde catálogo por borrar un dato maestro); `CASCADE` en `Producto` → `VarianteProducto`/`ImagenProducto` (son partes del producto y no existen sin él).
  - **`precio_ajustado` opcional:** si es `NULL`, la propiedad `precio_final` devuelve el `precio_base` del producto. Así no se duplica el precio en cada variante (evita anomalías de actualización, 3FN).
  - **`Talle.numero` es `DecimalField`** para soportar medios talles (9.5 US) sin errores de redondeo de `float`.
  - Validadores con `RegexValidator` para `cuit` (`XX-XXXXXXXX-X`) y `codigo_hex` (`#RRGGBB`).
  - `list_select_related` en el admin evita el problema de consultas N+1 al listar productos y variantes.
  - Verificado con Django 6.1 sobre el proyecto real: `migrate` crea las 8 tablas del catálogo + `usuarios_usuario` con sus claves foráneas, y el admin responde en los 9 modelos.
  - Verificado además: `check` sin issues, `migrate` + `loaddata` (111 objetos) OK, y pruebas manuales de que la base rechaza SKU duplicado, variante duplicada, segunda portada, talle duplicado y borrado de marca con productos.
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** "El producto es el concepto comercial y la variante es lo que físicamente está en el depósito. Por eso el stock y el SKU viven en `VarianteProducto`, y las reglas de unicidad están como constraints en la base para que ni el admin ni la API puedan romperlas."
  - **Para Valentino Arballo (Componentes / Frontend):** "Los nombres de campo (`precio_base`, `es_portada`, `codigo_hex`, `stock`) son los que va a recibir el frontend en `snake_case`; `codigo_hex` permite pintar el selector de color y `es_portada` define la imagen de `ProductCard`."

---

### Etapa 1 / Card #17: Configuración DRF, Docker, Autenticación Dual (JWT + Sesión), Permisos y UsuarioViewSet
- **Rama:** `feature/back-core-usuarios` -> `develop`
- **Responsable(s):** Manuel Gómez (Backend 1)
- **Archivos clave:**
  - `backend/pyproject.toml`, `backend/uv.lock`, `backend/Dockerfile`, `docker-compose.yml`, `backend/.env.example`
  - `backend/src/nucleo/settings.py`, `urls.py`, `routers.py`, `views.py`, `templates/inicio.html`
  - `backend/src/apps/usuarios/permissions.py`, `serializers.py`, `views.py`, `tests.py`
- **Qué se implementó:**
  - Integración del stack oficial de la API REST en `pyproject.toml` y `settings.py`: `djangorestframework`, `djangorestframework-simplejwt`, `drf-spectacular`, `django-filter` y `django-cors-headers`.
  - Contenedorización con Docker (`Dockerfile` y `docker-compose.yml`).
  - Configuración de **Autenticación Dual** (`JWTAuthentication` + `SessionAuthentication`), paginación global (`PageNumberPagination`, `PAGE_SIZE = 10`), Swagger UI en `/api/docs/` y vista HTML de bienvenida en `/`.
  - Implementación de permisos por rol (`EsAdministrador`, `EsAdminOEmpleado`, `EsAdminOEmpleadoOSoloLectura`, `PermisoUsuarioViewSet`), serializadores en `snake_case` (`UsuarioSerializer`, `RegistroUsuarioSerializer`) y exposición del **ViewSet #1 (`UsuarioViewSet`)** con `@action perfil` y tests automatizados.

---

### Plantilla para próximas entregas (Copiar por cada `Etapa / Feature PR`)

```markdown
### Etapa X / PR #XX: <Título de la funcionalidad — ej. Modelos y Admin de Catálogo>
- **Rama:** `feature/<area>-<descripcion>` -> `develop`
- **Responsable(s):** <Nombre(s) de los integrantes>
- **Archivos clave:** `<rutas de archivos creados o modificados>`
- **Qué se implementó:**
  - <Resumen claro de los cambios funcionales>
- **Decisiones técnicas y problemas resueltos:**
  - <Por qué se resolvió de esta forma y qué error o reto se superó>
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** <Idea fuerza de negocio/arquitectura>
  - **Para Valentino Arballo (Componentes / Frontend):** <Idea fuerza de renderizado/estado/validación>
```

---

## 2. Matriz de Defensa Rápida — Backend (Django + DRF)

Esta tabla resume las respuestas técnicas que los 4 integrantes deben dominar para defender el backend ante el **Prof. Facundo Lemo**:

| Pregunta / Concepto de Examen | Ubicación en Código | Respuesta Técnica para la Defensa Oral |
| :--- | :--- | :--- |
| **1. ¿Por qué `Usuario` hereda de `AbstractUser` con campo `rol`?** | `src/apps/usuarios/models.py` | Permite mantener todo el sistema de autenticación nativo de Django (hashing de contraseñas, sesiones, permisos y compatibilidad con `SimpleJWT`) agregando el campo `rol` (`ADMIN`, `EMPLEADO`, `CLIENTE`) desde la migración inicial (`AUTH_USER_MODEL`) para controlar permisos de endpoints sin tablas extras innecesarias. |
| **2. ¿Por qué separar `Producto` de `VarianteProducto` con `SKU`?** | `backend/src/apps/productos/models.py` | Porque `Producto` almacena los datos conceptuales compartidos (nombre, marca, categoría, precio base), mientras que el inventario físico real depende de la combinación única ` (producto, talle, color) ` identificada por un `sku`. Así los descuentos de stock en `DetallePedido` son exactos por talle y color. |
| **3. ¿Por qué `ImagenProducto` es una relación `1:N` separada?** | `backend/src/apps/productos/models.py` | Si guardáramos `imagen_1`, `imagen_2` en `Producto`, violaríamos la Primera Forma Normal (1FN) y limitaríamos la galería. Con una tabla `ImagenProducto` vinculada por `ForeignKey`, cada calzado puede tener N fotos ordenadas y una marcada como `es_portada`. Un `UniqueConstraint` parcial (`condition=Q(es_portada=True)`) garantiza a nivel base de datos que haya **como máximo una portada** por producto. |
| **4. ¿Cómo funcionan los `NestedSerializers` en la acción `list`?** | `src/apps/productos/views.py` y `src/apps/pedidos/views.py` | En `ProductoViewSet` y `PedidoViewSet` se sobrescribe el método `get_serializer_class(self)`. Cuando `self.action == 'list'` (o `'retrieve'`), devuelve el serializador de lectura con objetos anidados (marca, categoría, variantes o items del pedido); cuando es `'create'`/`'update'`, usa el serializador plano con IDs (`PrimaryKeyRelatedField`). |
| **5. ¿Cómo funcionan los `@action` personalizados y los permisos?** | `views.py` y `permissions.py` | El decorador `@action(detail=False/True, methods=[...])` agrega rutas semánticas fuera del CRUD estándar: `destacados` (`GET` de colección), `stock_por_talle` (`GET` de instancia) y `cancelar_pedido` (`POST` de instancia que valida estado y restituye stock). Las clases `BasePermission` verifican `request.user.rol` antes de ejecutar la acción. |
| **6. ¿Por qué coexisten `SessionAuthentication` y `JWTAuthentication`?** | `src/nucleo/settings.py` | `SessionAuthentication` permite usar el Panel de Administración de Django (`/admin/`) y probar la Browsable API en el navegador durante el desarrollo, mientras que `JWTAuthentication` (`SimpleJWT`) provee autenticación stateless mediante tokens para el frontend desacoplado en Next.js. |
| **7. ¿Qué garantiza que no haya variantes duplicadas?** | `backend/src/apps/productos/models.py` | Dos reglas en la base de datos: `sku` con `unique=True` y un `UniqueConstraint(fields=["producto", "talle", "color"])`. Si se intenta cargar dos veces la misma combinación, PostgreSQL/SQLite lanza `IntegrityError` aunque se use el admin o la API. |
| **8. ¿Por qué `PROTECT` en unas FK y `CASCADE` en otras?** | `backend/src/apps/productos/models.py` | `PROTECT` en datos maestros (`Marca`, `Categoria`, `Proveedor`, `Talle`, `Color`): no se puede borrar una marca que tiene productos. `CASCADE` en las partes del producto (`VarianteProducto`, `ImagenProducto`): si se elimina el producto, sus variantes e imágenes dejan de tener sentido. |
| **9. ¿Por qué `precio_ajustado` puede ser nulo?** | `backend/src/apps/productos/models.py` | La mayoría de las variantes se venden al `precio_base` del producto. Guardar el mismo precio en cada variante sería redundante (3FN). Solo se completa cuando una variante cuesta distinto (ej. talles especiales) y la propiedad `precio_final` resuelve cuál usar. |
| **10. ¿Cómo está configurado el panel de administración?** | `backend/src/apps/productos/admin.py` | Los 8 modelos tienen `list_display`, `list_filter`, `search_fields` y `ordering`. `ProductoAdmin` usa `TabularInline` para cargar variantes e imágenes en la misma pantalla y `list_select_related` para evitar consultas N+1; en `VarianteProductoAdmin` el stock es editable desde el listado (`list_editable`). |

---

## 3. Matriz de Defensa Rápida — Frontend (Next.js App Router)

Esta tabla registra cada componente y módulo del frontend para justificar su arquitectura ante el **Prof. Valentino Arballo**:

### 3.1. Justificación de Server Components vs. Client Components (`"use client"`)

| Componente / Archivo | Tipo (`Server` / `Client`) | Estado | Justificación Técnica para la Defensa Oral |
| :--- | :--- | :--- | :--- |
| `src/app/layout.jsx` | **Server Component** | ✅ Implementado | Layout raíz que define fuentes (`Space Grotesk`, `Inter`), estructura HTML base y envuelve el árbol con `Navbar` y `Footer` sin convertir toda la app en cliente. |
| `src/app/page.jsx` | **Server Component** | ✅ Implementado | Landing page de VELOX; obtiene los calzados destacados directamente desde el servidor para optimizar SEO y tiempo de primera carga (FCP). |
| `src/app/tecnologia/page.jsx` | **Server Component** | ✅ Implementado | Página estática del manifiesto técnico y tokens de diseño VELOX renderizada en el servidor sin costo de hidratación en el navegador. |
| `src/app/loading.jsx` | **Server Component** | ✅ Implementado | Estado global de carga (R1) renderizado en el servidor con `SkeletonCard` y animación `animate-pulse`. |
| `src/app/error.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Exigido por Next.js App Router para capturar errores en tiempo de ejecución y ejecutar el callback interactivo `reset()`. |
| `src/app/not-found.jsx` | **Server Component** | ✅ Implementado | Vista estática HTTP 404 (R1) renderizada en el servidor cuando una ruta o SKU no existe. |
| `src/app/productos/page.jsx` | **Server Component** | Planificado | Página de catálogo que lee `searchParams` en el servidor y consulta `GET /api/productos/` paginado, enviando menos JavaScript al navegador. |
| `src/app/productos/[id]/page.jsx` | **Server Component** | Planificado | Ficha técnica dinámica que obtiene el detalle del calzado en el servidor e hidrata únicamente el subcomponente interactivo de selección de talle/variante. |
| `src/components/Navbar.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Necesita consumir `usePathname()`, `useState()` y sincronizar el contador de productos del carrito en tiempo real y gestionar el menú móvil. |
| `src/components/Footer.jsx` | **Server Component** | ✅ Implementado | Componente puramente presentacional y estático sin hooks ni eventos de navegador; cero costo de hidratación en el cliente. |
| `src/components/ProductCard.jsx` | **Server / Client (según acción rápida)** | Planificado | Presenta imagen, marca, precio y enlace a `/productos/[id]` con estética Dark Mode (`#2A2A2A`). |
| `src/components/FilterBar.jsx` | **Client Component (`"use client"`)** | Planificado | Requiere manejar inputs controlados/eventos `onChange` y actualizar los query params de la URL (`useRouter`, `useSearchParams`) para filtrar por categoría, talle y precio. |
| `src/components/Button.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Botón reutilizable con variante primaria verde neón (`#39FF14`) y soporte para estados `disabled`/`loading` y eventos `onClick`. |
| `src/components/Badge.jsx` | **Server Component** | ✅ Implementado | Etiqueta visual sin estado para mostrar talles, categoría o disponibilidad de stock. |
| `src/components/Modal.jsx` | **Client Component (`"use client"`)** | Planificado | Requiere manejo de eventos de teclado/click (`onClose`) y control de visibilidad en el navegador para confirmar acciones CRUD o pedidos. |
| `src/components/SkeletonCard.jsx` | **Server Component** | ✅ Implementado | Estado visual de carga utilizado por `loading.jsx` con animación `animate-pulse` en Tailwind CSS sin lógica de cliente. |

### 3.2. Preguntas Clave de Arquitectura Frontend (R3 a R7)

| Eje de Evaluación | Implementación en VELOX | Cómo explicarlo en la Defensa Oral |
| :--- | :--- | :--- |
| **Autenticación con Server Actions y Cookies HTTP-Only (R4)** | `src/app/actions.js` y `src/lib/auth.js` | El formulario de `/login` invoca una Server Action (`"use server"`) que hace `POST /api/token/` a Django. El token JWT `access` recibido se guarda con `(await cookies()).set('access', token, { httpOnly: true })`. Así el token nunca queda expuesto a ataques XSS en `localStorage`. |
| **Cobertura de las 4 Operaciones CRUD (R3)** | `src/lib/api.js` y `src/app/actions.js` | Además de listar productos (`GET`) y crear/cancelar pedidos (`POST`), el frontend implementa las 4 operaciones completas (**Crear `POST`, Leer `GET`, Editar `PUT/PATCH` y Borrar `DELETE`**) sobre un recurso principal (gestión de productos/variantes en `/dashboard` o reseñas), revalidando la caché con `revalidatePath()`. |
| **Formularios con React Hook Form + Zod (R5)** | `src/validations/authSchema.js` y `orderSchema.js` | `React Hook Form` evita re-renderizados en cada tecla usando referencias no controladas, y `zodResolver` aplica validaciones declarativas cuyos nombres de campo están en `snake_case` exacto al `Serializer` de DRF. |
| **Estado Global con Context API (R6)** | `src/context/CartContext.jsx` | Provee `items`, `addToCart`, `removeFromCart`, `clearCart` y el cálculo de totales a toda la app mediante `useCart()`, sincronizando el carrito en `localStorage` mediante `useEffect` para no perder la compra al recargar. |
| **Testing Unitario con Vitest (R7)** | `src/app/__tests__/` | Se testean de forma aislada los esquemas de Zod (`authSchema`, `orderSchema`), el renderizado de `ProductCard` y las operaciones de `CartContext` usando `vitest` + `jsdom` + `@testing-library/react`. |
