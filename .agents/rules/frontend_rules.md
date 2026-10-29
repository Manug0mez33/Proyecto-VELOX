# Reglas de Desarrollo de Frontend: Proyecto VELOX (Next.js)

Este documento instruye a cualquier agente de IA o desarrollador sobre las restricciones, convenciones y patrones a aplicar en el frontend de VELOX.

---

## 1. Filosofía de Trabajo y Restricciones Técnicas
- **Enfoque KISS y didáctico:** El código debe ser limpio, comprensible y defendible oralmente ante la cátedra de Programación III (Docente Valentino Arballo).
- **Prohibido agregar dependencias no autorizadas:** 
  - Usar estrictamente las librerías vistas en clase: Next.js 16+, React 19, Tailwind CSS v4, `react-hook-form`, `@hookform/resolvers`, `zod`, `vitest`, `@testing-library/react`.
  - Prohibido instalar librerías complejas de componentes (Shadcn UI, MUI, Chakra, AntDesign).
  - Prohibido usar gestores de estado externos (Redux, Zustand, MobX). El estado global se resuelve con **React Context API**.

---

## 2. Identidad de Marca VELOX
- **Modo Oscuro como estado natural:** Fondo principal `#121212`, tarjetas/superficies `#2A2A2A`.
- **Acento:** Verde neón (`#39FF14`).
- **Textos:** Blanco `#FFFFFF` para títulos y `#D1D5DB` para cuerpo/subtítulos.
- **Tipografías:** `Space Grotesk` para títulos/H1/H2 y números de rendimiento; `Inter` para cuerpo y formularios.
- **Microcopy de UI:** Tono técnico, enérgico y directo (*"Acelerar"*, *"Analizar rendimiento"*, *"Adquirir"*).
- **Botones primarios:** Fondo Verde Neón (`#39FF14`), texto negro/carbón (`#121212`), fuente Inter Bold en mayúsculas.

---

## 3. Patrones de Código Obligatorios (Consigna R1 a R8)
1. **Server Actions para mutaciones:** Centralizar acciones en `src/app/actions.js` con `"use server"`.
2. **Tokens JWT en Cookies HTTP-Only:** Usar `(await cookies()).set("access", ...)` y `(await cookies()).get("access")`. Nunca almacenar tokens sensibles en `localStorage`.
3. **Consumo de API y CRUD Completo (4 operaciones):** Centralizar en `src/lib/api.js` usando `process.env.NEXT_PUBLIC_API_URL`. Implementar obligatoriamente las **4 operaciones CRUD (`GET`, `POST`, `PUT/PATCH`, `DELETE`)** sobre al menos 1 recurso principal (ej. `Producto`/`VarianteProducto` en `/dashboard` o `Resena`), además del flujo de `Pedido`.
4. **Formularios con RHF + Zod:** Validar obligatoriamente con esquemas de Zod antes de enviar datos al servidor.
5. **Context API para Carrito:** Implementar `CartContext` con `createContext` y `useContext`.
6. **Separación Server vs Client Components y Justificación para Defensa Oral:**
   - Server Components por defecto (fetching directo, catálogo, páginas estáticas).
   - `"use client"` únicamente en componentes con interactividad, eventos (`onClick`), formularios o hooks del navegador.
   - **Obligatorio:** Incluir un comentario de 1 línea al inicio de cada archivo de componente justificando por qué es Server Component o Client Component (`"use client"`) para la defensa oral.
7. **Testing:** Todos los tests se escriben en Vitest con Testing Library bajo `src/app/__tests__/`.

---

## 4. Git y Flujo de Trabajo
- **GitFlow estricto:** Ramas `main` (producción/entrega), `develop` (integración continua) y ramas de trabajo `feature/<nombre>` o `fix/<descripcion>`.
- Commits convencionales (`feat:`, `fix:`, `test:`, `docs:`).
- Merge únicamente vía Pull Request hacia `develop`, documentado con capturas de prueba y actualizando obligatoriamente `README.md` y `docs/bitacora_defensa.md`.
