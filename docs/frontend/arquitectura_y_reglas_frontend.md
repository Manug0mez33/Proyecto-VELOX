# Arquitectura, Requisitos y Reglas de Desarrollo: Frontend VELOX

**Espacio curricular:** Programación III (EFI 2026)  
**Institución:** Instituto Tecnológico Río Cuarto (ITEC)  
**Docente:** Valentino Arballo  
**Identidad del Proyecto:** **VELOX** — Calzado Deportivo de Alto Rendimiento  
**Stack Oficial:** Next.js (App Router), React 19, Tailwind CSS v4, React Hook Form, Zod, Vitest, Testing Library.  
**Repositorios Guía:** `.ref/next-drf` y `.ref/contenido-clases-tercero`

---

## 1. Filosofía de Desarrollo: Simplicidad, Rendimiento y Modo Oscuro Nativo
- **Consistencia con la Cátedra:** Se adoptan exclusivamente los patrones oficiales enseñados por el docente (Server Actions, cookies HTTP-Only, Context API nativa y Vitest).
- **Prohibido el bloatware:** No agregar librerías de UI complejas (como Shadcn completo, MUI o Chakra) ni gestores de estado externos (Redux, Zustand). La consigna exige **Tailwind CSS puro** y **React Context API**.
- **Identidad de Marca VELOX:**
  - Modo Oscuro nativo (`#121212` base, `#2A2A2A` surface, `#39FF14` verde neón).
  - Tipografías: `Space Grotesk` para títulos y números; `Inter` para cuerpo y formularios.
  - Tono de voz técnico y enérgico: *"Acelerar"*, *"Analizar rendimiento"*, *"Adquirir"*.
  - Fotografía técnica con calzados aislados (PNG transparente) y glow sutil verde neón en destacados.

---

## 2. Matriz de Requisitos Innegociables (R1 a R8)

> [!NOTE]
> **Alcance y flexibilidad de la propuesta:** Las rutas, páginas y componentes detallados en esta sección constituyen una **propuesta sugerida de referencia** diseñada para cumplir y superar los mínimos exigidos por la cátedra. No representan un límite cerrado: durante la etapa formal de planificación del proyecto, el equipo podrá agregar, ajustar o reorganizar más rutas, vistas, componentes e interacciones según lo requiera la solución.

### R1. Enrutamiento y Layouts
- **Mínimo 6 rutas principales:**
  1. `/`: Landing page, Hero interactivo con glow neón y calzados destacados.
  2. `/productos` (o `/catalogo`): Catálogo general con barra de búsqueda y filtros.
  3. `/tecnologia` (o `/nosotros`): Manifiesto de rendimiento y materiales de Velox.
  4. `/login`: Formulario de acceso autenticado con JWT.
  5. `/carrito`: Resumen de compras y checkout.
  6. `/dashboard`: Panel de seguimiento de pedidos / gestión de stock (según rol).
- **Al menos 1 ruta anidada:**
  - `/dashboard/pedidos` o `/productos/categoria/[slug]`
- **Al menos 2 rutas dinámicas:**
  - `/productos/[id]`: Ficha técnica del calzado con selector interactivo de talle/color/SKU.
  - `/dashboard/pedidos/[id]`: Detalle técnico de una orden de compra.
- **Estructura de Layouts:**
  - `src/app/layout.jsx`: Layout raíz con Navbar global (`VELOX`), Footer y `CartProvider`.
  - Layout anidado en `src/app/dashboard/layout.jsx`: Menú lateral técnico para la cuenta del usuario.
- **Manejo de Estados:**
  - Páginas de `loading.jsx` (esqueleto con acento verde neón), `error.jsx` y `not-found.jsx`.

### R2. Arquitectura de Componentes
- **Mínimo 8 componentes reutilizables:**
  1. `Navbar.jsx`: Barra superior con wordmark VELOX (X en neón), enlaces y contador del carrito.
  2. `Footer.jsx`: Manifiesto, links y créditos académicos.
  3. `ProductCard.jsx`: Tarjeta de calzado en Surface (`#2A2A2A`), bordes `rounded-lg`, precio e imagen transparente.
  4. `Button.jsx`: Botón primario (verde neón con texto carbón en mayúsculas) y variantes secundarias outline.
  5. `Badge.jsx`: Etiquetas para talles, categorías y disponibilidad de stock.
  6. `FilterBar.jsx`: Barra de filtros por categoría, género, talle y rango de precios.
  7. `Modal.jsx`: Ventana emergente accesible para confirmación de pedidos o acciones.
  8. `SkeletonCard.jsx`: Estado de carga visual.
- **Uso justificado de Server vs. Client Components:**
  - **Server Components:** Catálogo inicial, home, ficha técnica básica y layouts (mejor SEO, fetching directo y menor bundle JS enviado al cliente).
  - **Client Components (`"use client"`):** Filtros dinámicos, selector de variantes de talle/color, formularios (Login, Checkout) y el carrito con Context API.

### R3. Integración con la API de Django (Backend)
- **Consumo directo de la API REST y cobertura de las 4 operaciones CRUD (Crear, Leer, Editar y Borrar):**
  - `GET /api/productos/`: Consumo paginado con búsqueda y filtros mediante `django-filter`.
  - `GET /api/productos/{id}/`: Consulta de producto anidando marca, categoría y variantes con talles.
  - **CRUD completo sobre al menos 1 recurso principal** (ej. gestión de `Producto` / `VarianteProducto` en `/dashboard` o gestión de `Resena` mediante Server Actions en `src/app/actions.js`):
    - **Crear (`POST`):** Alta de producto/variante o publicación de reseña autenticada.
    - **Leer (`GET`):** Listado paginado y detalle de recurso.
    - **Editar (`PUT` / `PATCH`):** Actualización de stock/precio de variante o edición de reseña propia.
    - **Borrar (`DELETE`):** Baja lógica/física de variante o eliminación de reseña.
  - **Operaciones de Pedidos:**
    - `POST /api/pedidos/`: Creación de orden de compra desde el carrito.
    - `GET /api/pedidos/`: Historial de pedidos del usuario autenticado.
    - `POST /api/pedidos/{id}/cancelar_pedido/`: Ejecución de `@action` personalizada.
- **Manejo de estados:** Indicadores visuales claros de carga (`loading`) y alertas de error en caso de fallo de conexión con el backend.

### R4. Autenticación y Rutas Protegidas
- **Flujo de Auth:**
  - Formulario en `/login` que envía credenciales a Server Action `login()`.
  - Consumo del endpoint `/api/token/` de Django.
  - El token `access` se guarda en **Cookies HTTP-Only** (`(await cookies()).set(...)`), tal como en el repositorio guía `.ref/next-drf`.
  - Cierre de sesión mediante Server Action `logout()` borrando la cookie.
- **Protección de rutas:** Función utilitaria `requireToken()` o middleware en `src/middleware.js` para redirigir a `/login` si no hay sesión activa.

### R5. Formularios y Validaciones (React Hook Form + Zod)
- **React Hook Form** para control de estado de inputs sin re-renderizados innecesarios.
- **Zod** para esquemas estrictos de validación con `@hookform/resolvers/zod`:
  - `LoginSchema`: validación de nombre de usuario/email y contraseña con longitudes mínimas.
  - `OrderSchema` (o `ProductCreateSchema`): validación de datos de envío, método de pago y campos requeridos.
- Renderizado explícito de mensajes de error bajo cada input y captura de errores HTTP devueltos por la API.

### R6. Estado Global con Context API
- **Implementación:** `CartContext` con `createContext` y hook personalizado `useCart()`.
- **Responsabilidad:**
  - Almacenar items seleccionados (calzado, variante elegida, talle, color, cantidad).
  - Calcular total y cantidad de productos.
  - Métodos: `addToCart()`, `removeFromCart()`, `clearCart()`.
  - Sincronización en `localStorage` del navegador para persistencia de compra.

### R7. Testing Unitario con Vitest
- **Configuración:** `vitest.config.mts` con `jsdom` y `@testing-library/react`.
- **Mínimo 4 tests unitarios exigidos:**
  1. `LoginSchema.test.js`: Validación exitosa y fallida con Zod.
  2. `OrderSchema.test.js`: Validación de campos de pedido/checkout.
  3. `ProductCard.test.jsx`: Renderizado correcto de nombre, precio, marca e imagen.
  4. `CartContext.test.jsx`: Comportamiento de agregado, cálculo de total y vaciado de items.

### R8. Despliegue y Variables de Entorno
- Despliegue en **Vercel** conectado al repositorio de GitHub.
- Variable de entorno configurada: `NEXT_PUBLIC_API_URL` apuntando a la URL pública del backend desplegado.

---

## 3. Estructura de Carpetas del Frontend

Siguiendo la convención de `next-drf` y `contenido-clases-tercero`:

```text
frontend/
├── package.json
├── vitest.config.mts
├── vitest.setup.js
├── next.config.mjs
├── .env.example
├── public/
│   └── images/ (renders de calzados Velox)
└── src/
    ├── app/
    │   ├── actions.js          # Server Actions (login, logout, pedidos, CRUD)
    │   ├── layout.jsx          # Layout raíz con Navbar, Footer y CartProvider
    │   ├── page.jsx            # Home / Hero Velox
    │   ├── loading.jsx
    │   ├── error.jsx
    │   ├── not-found.jsx
    │   ├── login/
    │   │   └── page.jsx
    │   ├── productos/
    │   │   ├── page.jsx        # Catálogo con filtros y búsqueda
    │   │   └── [id]/
    │   │       └── page.jsx    # Ficha técnica y selector de variante
    │   ├── carrito/
    │   │   └── page.jsx
    │   ├── dashboard/
    │   │   ├── layout.jsx      # Layout anidado
    │   │   └── page.jsx        # Historial de pedidos o gestión de stock
    │   └── __tests__/          # Tests unitarios en src/app/__tests__/
    │       ├── authSchema.test.js
    │       ├── orderSchema.test.js
    │       ├── ProductCard.test.jsx
    │       └── CartContext.test.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── ProductCard.jsx
    │   ├── FilterBar.jsx
    │   ├── Button.jsx
    │   ├── Badge.jsx
    │   ├── Modal.jsx
    │   └── SkeletonCard.jsx
    ├── context/
    │   └── CartContext.jsx     # Context API para carrito
    ├── lib/
    │   ├── api.js              # Helpers de fetch a Django REST
    │   └── auth.js             # Helpers de cookies y verificación de JWT
    └── validations/
        ├── authSchema.js       # Esquemas de Zod
        └── orderSchema.js
```

---

## 4. Tokens de Diseño (Tailwind CSS)

Definidos en `src/app/globals.css` a partir del manual de marca de VELOX:

```css
@theme {
  --color-base: #121212;
  --color-surface: #2A2A2A;
  --color-accent: #39FF14;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #D1D5DB;
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

---

## 5. Reglas de Git y Entrega Académica

- **GitFlow estricto:** Ramas `main`, `develop` y ramas de tarea `feature/<nombre>`.
- **Commits:** Mensajes con formato Conventional Commits (`feat(cart): ...`, `test(auth): ...`).
- **PRs:** Ningún código entra a `develop`/`main` sin Pull Request descriptivo con capturas de prueba.
- **Tablero Ágil:** Vincular el proyecto a GitHub Projects o Trello con las tareas distribuidas entre los integrantes del grupo.
