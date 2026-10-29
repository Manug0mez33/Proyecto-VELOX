# Reglas de Contrato de API: Integración Django DRF ↔ Next.js (VELOX)

Este documento define el contrato estricto de comunicación entre el backend en **Django REST Framework** y el frontend en **Next.js (App Router)** para evitar errores de integración, desajustes de nombres de campos y fallos en tiempo de ejecución.

---

## 1. Paridad de Campos (`snake_case`)

- Los esquemas de validación en **Zod** (`src/validations/`) y los formularios con **React Hook Form** en Next.js deben utilizar **exactamente las mismas claves en `snake_case`** que exponen y reciben los `Serializers` de Django REST Framework (ej. `precio_base`, `variante_producto`, `direccion_envio`, `metodo_pago`, `stock_actual`).
- Prohibido renombrar claves a `camelCase` en los formularios si el endpoint de DRF espera `snake_case`, evitando transformaciones manuales propensas a bugs antes del `fetch`.

---

## 2. Estructura de Paginación DRF

- Todos los endpoints de listado (`GET` general) en Django REST Framework utilizan `PageNumberPagination`.
- Toda función consumidora de listados en `src/lib/api.js` debe procesar explícitamente el sobre paginado estándar de DRF:
  ```json
  {
    "count": 42,
    "next": "http://.../api/productos/?page=2",
    "previous": null,
    "results": [...]
  }
  ```
- Nunca asumir que un endpoint de listado devuelve un array plano (`[...]`); siempre extraer `.results` para iterar items y `.count` / `.next` / `.previous` para controles de paginación.

---

## 3. Cobertura CRUD de 4 Operaciones (Requisito R3)

- El frontend debe implementar y mantener operativas las **4 operaciones CRUD (`GET`, `POST`, `PUT/PATCH`, `DELETE`)** sobre al menos un recurso principal de la API REST (por ejemplo, la gestión completa de `Producto` / `VarianteProducto` en `/dashboard` o la gestión de `Resena` de calzado mediante Server Actions en `src/app/actions.js`), además de los endpoints transaccionales de `Pedido` (`GET`, `POST` y `@action` `cancelar_pedido`).

---

## 4. Manejo de Errores y Variables de Entorno

- **Captura estructurada de errores HTTP:**
  - **Errores `400 Bad Request` (Validación de DRF):** Capturar el diccionario de errores por campo devuelto por DRF (ej. `{ "sku": ["Ya existe una variante con este SKU."] }`) y mostrarlo en el formulario o alerta correspondiente de la UI.
  - **Errores `401 Unauthorized` / `403 Forbidden`:** Capturar la clave `detail` devuelta por SimpleJWT o permisos de DRF y redirigir a `/login` o informar falta de permisos en la interfaz.
- **Variables de Entorno Obligatorias:**
  - **Prohibido hardcodear `http://localhost:8000` o `http://127.0.0.1:8000`** dentro del código fuente de Next.js.
  - Usar siempre `process.env.NEXT_PUBLIC_API_URL` en el frontend y variables de entorno para `CORS_ALLOWED_ORIGINS` en `settings.py` del backend.
