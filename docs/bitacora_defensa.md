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

### Etapa 2 (Sprint 2 — Frontend Parte 2): Estado Global CartContext (R6) + Esquemas Zod en snake_case (R5) + Layout Anidado /dashboard (R1), Helpers API (R3), Componente Modal (R2) y Tests Vitest (R7)
- **Fecha:** 30 de Octubre de 2026
- **Rama:** `feature/front-context-schemas` -> `develop`
- **Responsable(s):** Tomás Benavidez (Frontend 2)
- **Archivos clave:**
  - `frontend/src/context/CartContext.jsx` (Context API + hook `useCart()`)
  - `frontend/src/validations/authSchema.js`, `frontend/src/validations/orderSchema.js` (Validaciones Zod)
  - `frontend/src/components/Modal.jsx` (Componente reutilizable de diálogo accesible)
  - `frontend/src/lib/api.js` (Helper HTTP, `ApiError` y normalización de sobre paginado DRF)
  - `frontend/src/app/dashboard/layout.jsx`, `frontend/src/app/dashboard/page.jsx` (Layout anidado R1 y vista administrativa)
  - `frontend/src/app/login/page.jsx` (Formulario interactivo RHF + Zod)
  - `frontend/src/app/carrito/page.jsx` (Vista del carrito reactivo conectado a `CartContext`)
  - `frontend/src/app/layout.jsx`, `frontend/src/components/Navbar.jsx` (Integración de `CartProvider` y contador reactivo)
  - `frontend/vitest.config.mjs`, `frontend/src/app/__tests__/` (Configuración de Vitest y 26 tests unitarios)
  - `README.md`, `docs/bitacora_defensa.md`
- **Qué se implementó:**
  - Se construyó el estado global del carrito en `src/context/CartContext.jsx` mediante `createContext` y `useContext`. Expone `items`, `totalItems`, `subtotal`, `total`, `isHydrated`, `addToCart()`, `updateQuantity()`, `removeFromCart()` y `clearCart()`. Sincroniza bidireccionalmente con `localStorage` (`velox_cart`) y despacha eventos de storage para reactividad multi-pestaña.
  - Se conectó `CartProvider` en el Layout raíz (`src/app/layout.jsx`) manteniendo la naturaleza Server Component del layout, y se refactorizó `src/components/Navbar.jsx` para consumir reactivamente `const { totalItems: cartCount } = useCart()`, eliminando escuchadores manuales redundantes.
  - Se crearon los esquemas de validación Zod en `src/validations/` con claves exactas en `snake_case`:
    - `authSchema.js`: `loginSchema` (username, password) y `registerSchema` (username, email, password, confirm_password con validación de coincidencia vía `.refine()`, first_name, last_name, telefono, direccion, ciudad).
    - `orderSchema.js`: `checkoutSchema` y `orderItemSchema` para creación de pedidos con dirección de envío, ciudad, código postal, teléfono, método de pago (`TARJETA`, `TRANSFERENCIA`, `EFECTIVO`) e items requeridos.
  - Se implementó el componente reutilizable `Modal.jsx` (`Client Component`), diseñado con la estética Dark Mode de VELOX (`#1E1E1E`, `#2A2A2A`, `#39FF14`), manejo de accesibilidad (`role="dialog"`, `aria-modal="true"`, tecla `Escape`), cierre por clic en el backdrop con `stopPropagation` en la tarjeta y bloqueo de scroll en el `body`.
  - Se desarrolló el cliente HTTP unificado en `src/lib/api.js`, capaz de consumir `process.env.NEXT_PUBLIC_API_URL`, procesar de forma segura el sobre paginado de DRF (`{ count, next, previous, results }`) mediante `normalizePaginatedResponse()`, capturar errores de validación 400 y 401/403 mediante la clase `ApiError`, y proveer métodos CRUD (`get`, `getPaginated`, `post`, `put`, `patch`, `delete`).
  - Se creó el Layout anidado `src/app/dashboard/layout.jsx` (R1) y la vista principal `/dashboard` con KPIs de negocio (modelos, variantes SKU, stock en depósito) y matriz de estado de operaciones CRUD.
  - Se maquetaron las vistas interactivas `/login` (formulario RHF + Zod con mensajes de error por campo y credenciales demo de examen) y `/carrito` (listado interactivo de calzado, selector de cantidades, cálculo dinámico de subtotal, formulario interactivo de checkout con React Hook Form + Zod en paridad `snake_case` y modals de confirmación). Esto cumple estrictamente el requisito de contar con **2 o más formularios validados con RHF + Zod** en el frontend.
  - Se configuró Vitest (`vitest.config.mjs`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`) y se implementaron **41 tests unitarios** organizados en 6 suites bajo `src/app/__tests__/`, cubriendo `CartContext` (incluyendo sincronización multi-pestaña por evento `storage`), `authSchema`, `orderSchema` (`checkoutFormSchema`), `api.js` (todos los métodos CRUD y errores DRF), `Modal.jsx` y el componente de checkout en `/carrito`.
- **Decisiones técnicas y problemas resueltos:**
  - **Prevención de Hydration Mismatch y sincronización multi-pestaña en `CartContext`:** Como `localStorage` solo existe en el cliente (navegador), leerlo directamente en el estado inicial causaba discrepancia entre el HTML generado por el servidor y el cliente. Se resolvió inicializando `items = []` e introduciendo una bandera `isHydrated` activada en el primer `useEffect`. Además, se agregó un listener del evento nativo `storage` de `window` para que si el usuario opera en múltiples pestañas o ventanas en simultáneo, el carrito se actualice automáticamente sin recargar la página.
  - **Paridad estricta `snake_case` y 2+ Formularios con RHF:** Evita errores de deserialización al conectar Next.js con Django REST Framework. Tanto en `authSchema` como en `orderSchema` (`checkoutFormSchema`), los nombres coinciden letra por letra con los campos de `Usuario`, `RegistroUsuarioSerializer`, `Producto` y `VarianteProducto`. El formulario de checkout en `/carrito` permite ingresar `direccion_envio`, `ciudad`, `codigo_postal`, `telefono_contacto`, `metodo_pago` y `notas_adicionales`, empaquetando los items del carrito y validando la orden completa antes del envío.
  - **Cliente HTTP unificado y sin URLs hardcodeadas:** En lugar de realizar peticiones `fetch` dispersas con URLs hardcodeadas, toda la aplicación consume `src/lib/api.js` respetando la variable de entorno `process.env.NEXT_PUBLIC_API_URL` (con `.env.local`), capturando errores de campo devueltos por DRF.
  - **Robustez en normalización paginada:** `normalizePaginatedResponse` en `src/lib/api.js` inspecciona si los datos vienen envueltos en `{ results: [...] }` (paginación estándar de DRF) o como un array plano, retornando siempre un contrato uniforme para la capa visual.
  - **Aislamiento en Layout Anidado:** `src/app/dashboard/layout.jsx` es un Server Component que no contamina el resto de la aplicación con estados pesados, cumpliendo R1 de forma eficiente.
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** "Frontend y Backend comparten exactamente el mismo diccionario de datos: los esquemas de Zod en Next.js usan `snake_case` estricto (`direccion_envio`, `metodo_pago`, `variante_sku`), garantizando que al enviar una petición `POST` al ViewSet de DRF no haya discrepancia de nombres ni necesidad de middlewares de transformación."
  - **Para Valentino Arballo (Componentes / Frontend):** "Se implementó el estado global del carrito con React Context API nativa (`CartContext`), sin gestores externos no vistos en clase. Se evitó el parpadeo de hidratación con la bandera `isHydrated` y se sincronizan pestañas en tiempo real con el evento `storage`. Contamos con 2 formularios completos validados con React Hook Form + Zod (`/login` y el checkout de `/carrito`). El modal es un Client Component accesible con listener de teclado para la tecla Escape y bloqueo de scroll, y la suite de Vitest valida 41 casos de prueba unitarios en 6 suites pasando al 100%."

---

### Etapa 2 (Sprint 2 — Frontend Parte 3): Conexión de Checkout `/carrito` a `POST /api/pedidos/` con React Hook Form + Zod + JWT, Variantes Reales y Tests Vitest (R5, R6, R7)
- **Fecha:** 30 de Octubre de 2026
- **Rama:** `feature/front-carrito-checkout` -> `develop`
- **Responsable(s):** Tomás Benavidez (Frontend 2)
- **Archivos clave:**
  - `frontend/src/app/carrito/page.jsx` (Checkout conectado a DRF, guard JWT, modal con datos reales y captura de errores)
  - `frontend/src/validations/orderSchema.js` (Alineación exacta con `Pedido.MetodoPago` y soporte de `detalles` para DRF)
  - `frontend/src/context/CartContext.jsx` (Preservación de `variante_id` en los ítems de compra)
  - `frontend/src/app/__tests__/CarritoCheckout.test.jsx`, `frontend/src/app/__tests__/orderSchema.test.js`, `frontend/src/app/__tests__/api.test.js`, `frontend/src/app/__tests__/CartContext.test.jsx` (51 tests unitarios en Vitest al 100%)
  - `README.md`, `docs/bitacora_defensa.md`
- **Qué se implementó:**
  - Conexión del formulario interactivo de Checkout en `/carrito` con el endpoint transaccional de Django REST Framework `POST /api/pedidos/`.
  - Validación de autenticación JWT mediante lectura de `localStorage.getItem("velox_access_token")`. Si el usuario no ha iniciado sesión, se despliega un banner de advertencia destacado con botón directo a `/login` y credenciales de prueba, bloqueando el envío si no existe token y sincronizando el token al pulsar el checkout.
  - Sincronización del enum `metodo_pago` en `orderSchema.js` y el selector HTML de `/carrito` con `Pedido.MetodoPago`: `"TARJETA_CREDITO"`, `"TARJETA_DEBITO"`, `"TRANSFERENCIA"` y `"EFECTIVO"`.
  - Empaquetado de la orden en el contrato estricto de `PedidoCreateSerializer`: concatenación de `direccion_envio` (`direccion`, `ciudad`, `codigo_postal`, `telefono_contacto` y `notas_adicionales` hasta 255 caracteres) y mapeo del array `detalles: [{ variante: id, cantidad }]`.
  - Envío mediante `api.post("/pedidos/", drfPayload, { token })` pasando el token de autorización en el encabezado `Authorization: Bearer <token>`.
  - Al recibir `201 Created` desde el backend, se captura el ID real del pedido (`id`), total y fecha devueltos por DRF, se vacía automáticamente el carrito (`clearCart()`) y se presenta el modal con los datos reales de la transacción y el desglose de artículos adquiridos.
  - Captura estructurada de excepciones mediante `ApiError` y función `formatDrfError()` recursiva, procesando serializadores anidados de DRF sin devolver `[object Object]` y visualizando errores de stock insuficiente (`400 Bad Request`) o sesión expirada (`401 Unauthorized`) dentro del modal con enlace de recuperación directa al login.
  - Actualización de los calzados de prueba rápida en `/carrito` (`handleAddSampleItem`) para inyectar variantes físicas reales existentes en la base de datos (IDs 54, 49, 55, 44 cargadas del fixture `catalogo_velox.json`).
  - Ampliación de la suite de pruebas unitarias en Vitest de 41 a **51 tests** pasando al 100% en 6 suites.
- **Decisiones técnicas y problemas resueltos:**
  - **Integración transaccional sin desincronización de inventario:** Se evitó simular compras en el frontend. Cada compra descuenta stock físico real en `VarianteProducto` dentro de la transacción atómica de Django con bloqueo `select_for_update()`.
  - **Guard de autenticación sin rebotes bruscos:** En lugar de expulsar al usuario del carrito con un redirect inesperado, se muestra un banner amigable dentro del flujo de compra invitándolo a iniciar sesión en `/login` para asociar su token JWT, permitiendo una experiencia de compra fluida.
  - **Mapeo de errores legibles de DRF:** La función `formatDrfError()` descompone recursivamente estructuras complejas de error de DRF (objetos de validación anidada `{ detalles: [{ variante: [...] }] }`, listas y `detail`), impidiendo que el cliente reciba `[object Object]` y asegurando feedback transparente.
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** "El checkout del frontend cumple rigurosamente el contrato de `PedidoCreateSerializer`: envía `metodo_pago` alineado al enum `Pedido.MetodoPago`, la dirección física formateada para `direccion_envio` y la lista de `detalles` con `variante` (entero de `VarianteProducto`) y `cantidad`. Todo viaja bajo `Authorization: Bearer <token>` para que el ViewSet asocie el pedido a `request.user` y ejecute el descuento atómico de inventario."
  - **Para Valentino Arballo (Componentes / Frontend):** "En `/carrito`, el formulario modal se valida en dos niveles: en el cliente con React Hook Form + Zod (`checkoutFormSchema` y `orderSchema`) y en el servidor contra la API de DRF. El token JWT se lee de `localStorage` y se propaga en las cabeceras HTTP de `api.post()`. El estado del carrito se limpia de inmediato ante la respuesta `201 Created` y los 51 tests unitarios de Vitest comprueban todos los caminos felices y de excepción (errores 400 por falta de stock, errores anidados formateados recursivamente y 401 por sesión inválida)."

---

### Etapa 2 / Card #24: Catálogo Paginado (/productos), Ficha Dinámica (/productos/[id]) y Componentes FilterBar y ProductCard (R1, R2, R3, R7)
- **Rama:** `feature/front-catalogo-rutas` -> `develop`
- **Responsable(s):** Juan Falco (Frontend 1)
- **Archivos clave:**
  - `frontend/src/components/ProductCard.jsx`
  - `frontend/src/components/FilterBar.jsx`
  - `frontend/src/components/ProductDetailClient.jsx`
  - `frontend/src/app/productos/page.jsx`
  - `frontend/src/app/productos/[id]/page.jsx`
  - `frontend/src/app/__tests__/ProductCard.test.jsx`
  - `README.md`, `docs/bitacora_defensa.md`
- **Qué se implementó:**
  - `src/components/ProductCard.jsx` (`Client Component`): Tarjeta de producto con estética Dark Mode (`#2A2A2A`, `rounded-lg` 8px), silueta técnica de calzado con glow neón, selector interactivo de talle en tarjeta con actualización en vivo de SKU/precio, badges de categoría y stock, y botón de compra directa que despacha a `CartContext` (`addToCart`).
  - `src/components/FilterBar.jsx` (`Client Component`): Barra de filtrado con búsqueda por texto libre (nombre, descripción, SKU), filtros por marca, categoría, género, pills rápidas de talles AR, ordenamiento y sincronización declarativa con los query parameters de la URL (`useRouter` y `useSearchParams`).
  - `src/app/productos/page.jsx` (`Server Component`): Página de catálogo que lee `searchParams` en el servidor, consume `api.getPaginated('/productos/')` procesando siempre el sobre paginado de DRF (`{ count, next, previous, results }`) con fallback exhaustivo en memoria de 12 productos con variantes y barra de paginación DRF (`Anterior`, páginas, `Siguiente`).
  - `src/app/productos/[id]/page.jsx` (`Server Component`): Ruta dinámica de ficha técnica que obtiene el detalle en el servidor para optimizar SEO y metadata dinámica, e hidrata la isla interactiva `ProductDetailClient.jsx` para conmutar fotos de galería (ImagenProducto 1:N), selector de color (hex) y talle con stock verificado en tiempo real (`@action stock_por_talle`) y sección completa de reseñas de atletas (`ResenaViewSet`).
  - `src/app/__tests__/ProductCard.test.jsx`: 3 pruebas unitarias exhaustivas con Vitest + Testing Library verificando renderizado de marca, precio y nombre, cambio de variante/SKU y agregado al carrito.
- **Decisiones técnicas y problemas resueltos:**
  - **Respeto estricto del sobre paginado DRF:** En cumplimiento de `api_contract_rules.md`, nunca se asume un array plano en listados; se extrae `.results` y se utilizan `.count`, `.next` y `.previous` para construir la barra de paginación preservando todos los filtros activos en la URL.
  - **Desacople conceptual 3FN en UI:** Se visualiza explícitamente en el selector interactivo que el producto (`Producto`) es el contenedor y que la unidad física comprable con SKU único y stock real es la combinación de talle y color (`VarianteProducto`).
  - **Arquitectura de islas de servidor/cliente:** Las páginas `/productos` y `/productos/[id]` son Server Components para mantener rápida la primera carga y optimizar SEO; la interactividad se delega a `FilterBar.jsx`, `ProductCard.jsx` y `ProductDetailClient.jsx` con `"use client"`.
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** "El catálogo y la ficha respetan exactamente los nombres de campo en `snake_case` del backend (`precio_base`, `sku_referencia`, `stock_total`, `codigo_hex`), consumiendo el sobre paginado de DRF y demostrando en la interfaz cómo el stock no está en el producto sino en la variante SKU."
  - **Para Valentino Arballo (Componentes / Frontend):** "Implementamos la arquitectura recomendada por la cátedra: `/productos` y `/productos/[id]` son Server Components que resuelven los datos y metadatos en el servidor, mientras que `FilterBar` y `ProductCard` son Client Components con `"use client"` justificado en su primera línea para gestionar eventos de usuario, sincronizar searchParams con la URL y conectar con `CartContext`."

---

### Etapa 2 / PR: ViewSets de Catálogo + NestedSerializer + Filtros + @action
- **Rama:** `feature/back-api-productos` -> `develop`
- **Responsable(s):** Valentino Cambria (Backend 2)
- **Archivos clave:**
  - `backend/src/apps/productos/serializers.py`, `views.py`, `filters.py`, `tests.py`
  - `backend/src/nucleo/routers.py` (registro de 5 ViewSets)
  - `README.md`, `docs/bitacora_defensa.md`
- **Qué se implementó:**
  - 5 ViewSets registrados en el router (`/api/productos/`, `/api/marcas/`, `/api/categorias/`, `/api/variantes/`, `/api/proveedores/`); con los 3 de Usuarios y Pedidos el proyecto llega a **10 ViewSets** (mínimo exigido: 8).
  - **NestedSerializer #1:** `ProductoViewSet.get_serializer_class()` devuelve `ProductoNestedSerializer` en `list`/`retrieve` (anida marca, categoría, imágenes y variantes) y `ProductoSerializer` plano con IDs en escritura.
  - **Filtros `django-filter`:** `ProductoFilter` por `marca`, `categoria`, `genero` y rango `precio_min`/`precio_max`; búsqueda en `nombre`/`descripcion`/marca y ordenamiento por precio, fecha y nombre.
  - **@action:** `destacados` (`detail=False`) y `stock_por_talle` (`detail=True`).
  - 7 tests de integración (`apps/productos/tests.py`); la suite completa del backend pasa (15 tests).
- **Decisiones técnicas y problemas resueltos:**
  - **Sin consultas N+1:** el listado usa `select_related` (marca, categoría) y `prefetch_related` (imágenes y variantes activas), así que siempre ejecuta 4 consultas sin importar cuántos productos haya. Un test lo verifica con `assertNumQueries(4)`.
  - **`stock_total` calculado en la base:** `annotate(Sum("variantes__stock"))` suma el stock de las variantes activas en la misma consulta, y `destacados` filtra con `stock_total__gt=0`.
  - **Permisos por rol reutilizados** de `apps/usuarios/permissions.py`: el catálogo es de lectura pública y escritura solo ADMIN/EMPLEADO (`EsAdminOEmpleadoOSoloLectura`); proveedores es completamente privado (`EsAdminOEmpleado`) porque expone CUIT y contactos. El público solo ve productos activos.
  - **Variantes por SKU:** `lookup_field = "sku"` (`/api/variantes/NK-PEG40-41-NEG/`), igual que en el panel del frontend: el SKU es el identificador real del artículo en el depósito.
  - **Criterio de `destacados`:** los 6 productos activos más recientes con stock, para no mostrar en la home un calzado que no se puede comprar.
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** "Leer y escribir son necesidades distintas: para mostrar el catálogo anidamos todo en una sola respuesta, pero para crear un producto alcanza con mandar IDs. `get_serializer_class()` elige el serializador según `self.action`."
  - **Para Valentino Arballo (Componentes / Frontend):** "La home consume `destacados` desde un Server Component, la ficha usa `stock_por_talle` para habilitar solo los talles con stock, y todos los campos llegan en `snake_case` (`precio_base`, `imagen_portada`, `stock_total`)."

---

### Etapa 2 / Card #27: Dashboard de Gestión, Rutas Anidadas/Dinámicas (/dashboard/pedidos y /dashboard/pedidos/[id]), @action cancelar_pedido y 4 Operaciones CRUD Completas (R1, R3)
- **Rama:** `feature/front-dashboard-crud` -> `develop`
- **Responsable(s):** Tomás Benavidez (Frontend 2) & Equipo VELOX
- **Archivos clave:**
  - `frontend/src/app/dashboard/layout.jsx` (navegación actualizada hacia `/dashboard/pedidos`)
  - `frontend/src/app/dashboard/page.jsx` (Server Component que integra `DashboardCrudManager`)
  - `frontend/src/app/dashboard/pedidos/page.jsx` (Client Component de listado reactivo de pedidos con filtros)
  - `frontend/src/app/dashboard/pedidos/[id]/page.jsx` (Server Component: 2da ruta dinámica obligatoria)
  - `frontend/src/components/PedidoDetalleClient.jsx` (Client Component: ficha de orden y botón `@action`)
  - `frontend/src/components/DashboardCrudManager.jsx` (Client Component: 4 operaciones CRUD completas)
  - `frontend/src/app/__tests__/DashboardPedidos.test.jsx`, `PedidoDetalle.test.jsx`, `DashboardCrudManager.test.jsx`
  - `README.md`, `docs/bitacora_defensa.md`
- **Qué se implementó:**
  - **Ruta anidada `/dashboard/pedidos` (R1):** listado reactivo de pedidos consumiendo `GET /api/pedidos/` con token JWT, filtros dinámicos por estado (`TODOS`, `PENDIENTE`, `PAGADO`, `ENVIADO`, `ENTREGADO`, `CANCELADO`), badges semánticos, buscador en tiempo real (por ID, SKU o cliente), estados de carga (skeletons) y empty state.
  - **2da ruta dinámica obligatoria de la EFI `/dashboard/pedidos/[id]` (R1):** Server Component que resuelve el parámetro de ruta e hidrata la isla interactiva `PedidoDetalleClient.jsx`. Muestra ficha completa de la orden, desglose de calzados (SKU, nombre, talle AR, color, cantidad, precio unitario y subtotal), datos del cliente y dirección de entrega.
  - **Acción personalizada `@action` de DRF (cancelar_pedido):** botón interactivo que abre `Modal.jsx` para confirmar la cancelación. Al confirmar, ejecuta `POST /api/pedidos/{id}/cancelar_pedido/`, actualiza el estado a `CANCELADO` reactivamente en la interfaz y restituye automáticamente el stock físico de cada variante SKU en la base de datos de Django.
  - **4 Operaciones CRUD Completas (R3):** módulo interactivo `DashboardCrudManager.jsx` embebido en `/dashboard`:
    - **READ (`GET`):** listado paginado de variantes SKU (`GET /api/variantes/`) y reseñas de atletas (`GET /api/resenas/`) procesando el sobre paginado `{ count, next, previous, results }`.
    - **UPDATE (`PATCH`):** modal interactivo para ajustar stock físico o precio de una variante (`PATCH /api/variantes/{sku}/`) y editar reseñas (`PATCH /api/resenas/{id}/`) con actualización inmediata en pantalla.
    - **CREATE (`POST`):** modales accesibles para dar de alta nuevas variantes SKU (`POST /api/variantes/`) y nuevas reseñas (`POST /api/resenas/`).
    - **DELETE (`DELETE`):** eliminación con diálogo de confirmación accesible en `Modal.jsx` para variantes y reseñas (`DELETE /api/resenas/{id}/`).
  - **Testing Unitario (R7):** 3 nuevas suites con 15 tests adicionales en Vitest; la suite completa del frontend alcanza **69 tests unitarios en 10 archivos pasando al 100%**.
- **Decisiones técnicas y problemas resueltos:**
  - **Arquitectura de islas en rutas dinámicas:** `/dashboard/pedidos/[id]` permanece como Server Component para SEO y metadata, mientras que `PedidoDetalleClient` asume la interactividad y gestión de tokens en el navegador.
  - **Paridad estricta `snake_case`:** todos los formularios de variantes y pedidos envían exactamente los campos esperados por DRF (`precio_ajustado`, `direccion_envio`, `metodo_pago`).
  - **Manejo de permisos y estados no cancelables:** pedidos en estado `CANCELADO`, `ENVIADO` o `ENTREGADO` deshabilitan el botón de cancelación con badges explicativos respetando las reglas de negocio del backend.
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** "La acción `cancelar_pedido` demuestra cómo el backend asegura la integridad de los datos: usa `transaction.atomic()` y `select_for_update()` para devolver las unidades exactas a cada variante por SKU sin condiciones de carrera. El frontend respeta esta semántica invocando directamente el endpoint `@action`."
  - **Para Valentino Arballo (Componentes / Frontend):** "Cumplimos con las 2 rutas dinámicas obligatorias (`/productos/[id]` y `/dashboard/pedidos/[id]`) y las 4 operaciones CRUD completas (`GET`, `POST`, `PATCH`, `DELETE`). Cada nuevo componente incluye su comentario justificando Server vs. Client Component, y los diálogos modales garantizan accesibilidad con foco, backdrop y tecla Escape."

---

### Plantilla para próximas entregas (Copiar por cada `Etapa / Feature PR`)
### Etapa 2 / Feature: Feedback de Error en Modales y Sincronización Reactiva de KPIs en Dashboard
- **Rama:** `feature/front-dashboard-crud` -> `develop`
- **Responsable(s):** Tomás Benavidez (Frontend 2)
- **Archivos clave:**
  - `frontend/src/components/DashboardCrudManager.jsx`
  - `frontend/src/app/dashboard/page.jsx`
  - `frontend/src/app/__tests__/DashboardCrudManager.test.jsx`
  - `frontend/src/app/__tests__/DashboardPage.test.jsx`
  - `README.md`, `docs/bitacora_defensa.md`
- **Qué se implementó:**
  - **Feedback visual directo en ventana modal (R3):** En el modal de alta de variante (`isCreateVarianteOpen`), los errores devueltos por DRF (SKU duplicado o unicidad producto-talle-color) se renderizan directamente dentro del cuerpo del modal con `role="alert"`, limpiándose reactivamente al modificar inputs o cerrar/reabrir el modal.
  - **Manejo resiliente en eliminación modal (DELETE):** Cuando `DELETE /api/variantes/{sku}/` es rechazado por integridad referencial (variante vinculada a órdenes de compra existentes), el modal de confirmación permanece abierto, renderiza la causa técnica dentro del modal y sustituye las acciones por el botón "ENTENDIDO / CERRAR".
  - **KPIs reactivos de inventario:** Se conectaron las tarjetas superiores de métricas en `/dashboard` ("STOCK EN DEPÓSITO" y "VARIANTES SKU ACTIVAS") para computar reactivamente el stock físico total y SKU activos sincronizados con `DashboardCrudManager` mediante el prop `onVariantesChange` ante mutaciones GET, POST, PATCH y DELETE.
- **Decisiones técnicas y problemas resueltos:**
  - Se eliminó el problema de UX donde alertas renderizadas a nivel de página quedaban ocultas tras el backdrop oscuro y desenfoque del modal.
  - Se añadieron estados de guardia `isSubmittingVariante` e `isDeletingVariante` para evitar peticiones duplicadas por dobles clics en conexiones con latencia.
- **Guía para la defensa oral (Cómo explicarlo al docente):**
  - **Para Facundo Lemo (Proceso / Backend):** "La integridad referencial de PostgreSQL/Django no se oculta ni rompe la interfaz: si una variante tiene pedidos asociados, el backend responde 400 Bad Request y el frontend lo explica didácticamente en el modal para proteger los datos transaccionales."
  - **Para Valentino Arballo (Componentes / Frontend):** "`page.jsx` en `/dashboard` se convierte en Client Component (`'use client'`) porque gestiona el estado reactivo superior de métricas de inventario derivadas (`totalStock`, `activasCount`), manteniéndose sincronizado con las mutaciones del hijo `DashboardCrudManager` sin requerir recarga de página."

---

## 2. Matriz de Defensa Rápida — Backend (Django + DRF)

Esta tabla resume las respuestas técnicas que los 4 integrantes deben dominar para defender el backend ante el **Prof. Facundo Lemo**:

| Pregunta / Concepto de Examen | Ubicación en Código | Respuesta Técnica para la Defensa Oral |
| :--- | :--- | :--- |
| **1. ¿Por qué `Usuario` hereda de `AbstractUser` con campo `rol`?** | `src/apps/usuarios/models.py` | Permite mantener todo el sistema de autenticación nativo de Django (hashing de contraseñas, sesiones, permisos y compatibilidad con `SimpleJWT`) agregando el campo `rol` (`ADMIN`, `EMPLEADO`, `CLIENTE`) desde la migración inicial (`AUTH_USER_MODEL`) para controlar permisos de endpoints sin tablas extras innecesarias. |
| **2. ¿Por qué separar `Producto` de `VarianteProducto` con `SKU`?** | `backend/src/apps/productos/models.py` | Porque `Producto` almacena los datos conceptuales compartidos (nombre, marca, categoría, precio base), mientras que el inventario físico real depende de la combinación única ` (producto, talle, color) ` identificada por un `sku`. Así los descuentos de stock en `DetallePedido` son exactos por talle y color. |
| **3. ¿Por qué `ImagenProducto` es una relación `1:N` separada?** | `backend/src/apps/productos/models.py` | Si guardáramos `imagen_1`, `imagen_2` en `Producto`, violaríamos la Primera Forma Normal (1FN) y limitaríamos la galería. Con una tabla `ImagenProducto` vinculada por `ForeignKey`, cada calzado puede tener N fotos ordenadas y una marcada como `es_portada`. Un `UniqueConstraint` parcial (`condition=Q(es_portada=True)`) garantiza a nivel base de datos que haya **como máximo una portada** por producto. |
| **4. ¿Cómo funcionan los `NestedSerializers` en la acción `list`?** | `backend/src/apps/productos/views.py` y `backend/src/apps/pedidos/views.py` | En `ProductoViewSet` y `PedidoViewSet` se sobrescribe el método `get_serializer_class(self)`. Cuando `self.action == 'list'` (o `'retrieve'`), devuelve el serializador de lectura con objetos anidados (marca, categoría, variantes o items del pedido); cuando es `'create'`/`'update'`, usa el serializador plano con IDs (`PrimaryKeyRelatedField`). |
| **5. ¿Cómo funcionan los `@action` personalizados y los permisos?** | `views.py` y `permissions.py` | El decorador `@action(detail=False/True, methods=[...])` agrega rutas semánticas fuera del CRUD estándar: `destacados` (`GET` de colección), `stock_por_talle` (`GET` de instancia) y `cancelar_pedido` (`POST` de instancia que valida estado y restituye stock). Las clases `BasePermission` verifican `request.user.rol` antes de ejecutar la acción. |
| **6. ¿Por qué coexisten `SessionAuthentication` y `JWTAuthentication`?** | `src/nucleo/settings.py` | `SessionAuthentication` permite usar el Panel de Administración de Django (`/admin/`) y probar la Browsable API en el navegador durante el desarrollo, mientras que `JWTAuthentication` (`SimpleJWT`) provee autenticación stateless mediante tokens para el frontend desacoplado en Next.js. |
| **7. ¿Qué garantiza que no haya variantes duplicadas?** | `backend/src/apps/productos/models.py` | Dos reglas en la base de datos: `sku` con `unique=True` y un `UniqueConstraint(fields=["producto", "talle", "color"])`. Si se intenta cargar dos veces la misma combinación, PostgreSQL/SQLite lanza `IntegrityError` aunque se use el admin o la API. |
| **8. ¿Por qué `PROTECT` en unas FK y `CASCADE` en otras?** | `backend/src/apps/productos/models.py` | `PROTECT` en datos maestros (`Marca`, `Categoria`, `Proveedor`, `Talle`, `Color`): no se puede borrar una marca que tiene productos. `CASCADE` en las partes del producto (`VarianteProducto`, `ImagenProducto`): si se elimina el producto, sus variantes e imágenes dejan de tener sentido. |
| **9. ¿Por qué `precio_ajustado` puede ser nulo?** | `backend/src/apps/productos/models.py` | La mayoría de las variantes se venden al `precio_base` del producto. Guardar el mismo precio en cada variante sería redundante (3FN). Solo se completa cuando una variante cuesta distinto (ej. talles especiales) y la propiedad `precio_final` resuelve cuál usar. |
| **10. ¿Cómo está configurado el panel de administración?** | `backend/src/apps/productos/admin.py` | Los 8 modelos tienen `list_display`, `list_filter`, `search_fields` y `ordering`. `ProductoAdmin` usa `TabularInline` para cargar variantes e imágenes en la misma pantalla y `list_select_related` para evitar consultas N+1; en `VarianteProductoAdmin` el stock es editable desde el listado (`list_editable`). |
| **11. ¿Cómo se evita el problema N+1 en el listado de productos?** | `backend/src/apps/productos/views.py` | `get_queryset()` usa `select_related` para las FK (marca, categoría: un JOIN) y `prefetch_related` para las relaciones inversas (imágenes y variantes: una consulta extra por relación). El listado siempre ejecuta 4 consultas sin importar cuántos productos haya, y un test lo verifica con `assertNumQueries`. |
| **12. ¿Cómo funcionan los filtros de productos?** | `backend/src/apps/productos/filters.py` | `ProductoFilter` (un `FilterSet` de `django-filter`) expone `marca`, `categoria`, `genero` y dos filtros propios: `precio_min` (`precio_base__gte`) y `precio_max` (`precio_base__lte`). `SearchFilter` agrega `?search=` y `OrderingFilter` agrega `?ordering=`; los tres están activos globalmente en `REST_FRAMEWORK`. |
| **13. ¿Qué devuelven `destacados` y `stock_por_talle`?** | `backend/src/apps/productos/views.py` | `destacados` (`detail=False`, actúa sobre la colección) devuelve los 6 productos activos más recientes con stock. `stock_por_talle` (`detail=True`, actúa sobre un producto) agrupa sus variantes activas por talle con el stock total y el detalle por color/SKU. |
| **14. ¿Quién puede modificar el catálogo?** | `backend/src/apps/usuarios/permissions.py` | Cualquiera puede leer productos, marcas, categorías y variantes (`SAFE_METHODS`), pero solo ADMIN o EMPLEADO pueden crear, editar o borrar. Proveedores es privado para el personal porque contiene CUIT y datos de contacto. |

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
| `src/app/productos/page.jsx` | **Server Component** | ✅ Implementado | Página de catálogo que lee `searchParams` en el servidor y consume `GET /api/productos/` paginado con sobre DRF (`count`, `next`, `previous`, `results`), enviando HTML optimizado y menos JavaScript al cliente. |
| `src/app/productos/[id]/page.jsx` | **Server Component** | ✅ Implementado | Ficha técnica dinámica (1ra ruta dinámica R1) que obtiene el calzado en el servidor para SEO y metadata OpenGraph, hidratando la isla interactiva `ProductDetailClient.jsx`. |
| `src/components/ProductDetailClient.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Isla interactiva de ficha técnica para navegación de fotos de galería (1:N), selección de talle/color SKU con stock dinámico y sección de reseñas. |
| `src/app/dashboard/layout.jsx` | **Server Component** | ✅ Implementado | Layout anidado (R1) que estructura el shell administrativo y barra lateral sin forzar hidratación en toda la página. |
| `src/app/dashboard/page.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Resumen ejecutivo del panel con KPIs reactivos en tiempo real ("STOCK EN DEPÓSITO" y "VARIANTES SKU ACTIVAS") sincronizados bidireccionalmente con el módulo interactivo `DashboardCrudManager`. |
| `src/app/dashboard/pedidos/page.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Ruta anidada (R1) para la gestión reactiva de pedidos con filtros por estado en tiempo real, buscador y badges semánticos. |
| `src/app/dashboard/pedidos/[id]/page.jsx` | **Server Component** | ✅ Implementado | 2da ruta dinámica obligatoria (R1) que valida el identificador de orden de compra en el servidor e hidrata la isla interactiva `PedidoDetalleClient`. |
| `src/components/PedidoDetalleClient.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Ficha completa de orden de compra con desglose de calzados SKU, dirección de entrega, modal de confirmación y llamada a `@action` `cancelar_pedido`. |
| `src/components/DashboardCrudManager.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Módulo interactivo del Dashboard para las 4 operaciones CRUD completas (R3) sobre inventario de variantes SKU y reseñas con validación, feedback de error en modal y confirmación protegida. |
| `src/app/login/page.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Formulario interactivo de autenticación con React Hook Form + Zod (`authSchema.js`) y captura de errores DRF. |
| `src/app/carrito/page.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Vista interactiva del carrito conectada a `CartContext` y al endpoint transaccional `POST /api/pedidos/` de DRF con autenticación JWT, selector de cantidades, formulario modal de checkout interactivo validado con React Hook Form + Zod (`checkoutFormSchema` y `orderSchema`), variantes reales del fixture y manejo de errores 400/401. |
| `src/context/CartContext.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Estado global con Context API (R6) para compartir carrito entre componentes cliente con persistencia en `localStorage`. |
| `src/components/Navbar.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Consume `useCart()` de forma reactiva para mostrar el contador de productos en tiempo real y gestiona el menú móvil. |
| `src/components/Footer.jsx` | **Server Component** | ✅ Implementado | Componente puramente presentacional y estático sin hooks ni eventos de navegador; cero costo de hidratación en el cliente. |
| `src/components/ProductCard.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Tarjeta interactiva con selector de talle AR en vivo, recálculo de SKU/precio, badges de categoría/stock y botón de compra directa a `CartContext`. |
| `src/components/FilterBar.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Filtros controlados (texto, marca, categoría, género, talles AR) sincronizados declarativamente con la URL vía `useRouter` y `useSearchParams`. |
| `src/components/Button.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Botón reutilizable con variante primaria verde neón (`#39FF14`) y soporte para estados `disabled`/`loading` y eventos `onClick`. |
| `src/components/Badge.jsx` | **Server Component** | ✅ Implementado | Etiqueta visual sin estado para mostrar talles, categoría o disponibilidad de stock. |
| `src/components/Modal.jsx` | **Client Component (`"use client"`)** | ✅ Implementado | Diálogo accesible (`role="dialog"`, `aria-modal="true"`) con cierre por tecla Escape, clic en backdrop y bloqueo de scroll en el body. |
| `src/components/SkeletonCard.jsx` | **Server Component** | ✅ Implementado | Estado visual de carga utilizado por `loading.jsx` con animación `animate-pulse` en Tailwind CSS sin lógica de cliente. |

### 3.2. Preguntas Clave de Arquitectura Frontend (R3 a R7)

| Eje de Evaluación | Implementación en VELOX | Cómo explicarlo en la Defensa Oral |
| :--- | :--- | :--- |
| **Autenticación con Server Actions y Cookies HTTP-Only (R4)** | `src/app/actions.js` y `src/lib/auth.js` | El formulario de `/login` invoca una Server Action (`"use server"`) que hace `POST /api/token/` a Django. El token JWT `access` recibido se guarda con `(await cookies()).set('access', token, { httpOnly: true })`. Así el token nunca queda expuesto a ataques XSS en `localStorage`. |
| **Cobertura de las 4 Operaciones CRUD (R3)** | `src/lib/api.js` y `src/components/DashboardCrudManager.jsx` | El frontend implementa operativamente las 4 operaciones completas (**Crear `POST`, Leer `GET`, Editar `PUT/PATCH` y Borrar `DELETE`**) sobre el recurso principal de inventario de variantes SKU y sobre reseñas de calzado en `/dashboard`, además del flujo transaccional y cancelación mediante `@action` en `/dashboard/pedidos/[id]`. |
| **Formularios con React Hook Form + Zod (R5)** | `src/validations/authSchema.js` y `orderSchema.js` | Cumple el requisito de 2+ formularios validados con RHF + Zod en `snake_case`: `/login` con `loginSchema` y el checkout modal en `/carrito` con `checkoutFormSchema` y `orderSchema`. RHF evita re-renderizados innecesarios y Zod garantiza paridad estricta con Django REST Framework. |
| **Estado Global con Context API (R6)** | `src/context/CartContext.jsx` | Provee `items`, `addToCart`, `removeFromCart`, `clearCart` y el cálculo de totales a toda la app mediante `useCart()`, sincronizando el carrito en `localStorage` con la bandera `isHydrated` (anti hydration mismatch) y el evento nativo `storage` para sincronización multi-pestaña. |
| **Testing Unitario con Vitest (R7)** | `src/app/__tests__/` | 82 tests unitarios en 11 suites (`CartContext.test.jsx`, `authSchema.test.js`, `orderSchema.test.js`, `api.test.js`, `Modal.test.jsx`, `CarritoCheckout.test.jsx`, `ProductCard.test.jsx`, `DashboardPedidos.test.jsx`, `PedidoDetalle.test.jsx`, `DashboardCrudManager.test.jsx`, `DashboardPage.test.jsx`) testeando componentes interactivos, esquemas Zod, métodos CRUD, catálogo de productos, checkout conectado a DRF, gestión de pedidos, cancelación `@action`, KPIs reactivos de inventario y feedback de error en modales. |
