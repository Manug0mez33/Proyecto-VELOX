**Institución:** ITEC Río Cuarto  
**Carrera:** Técnico Superior en Desarrollo de Software  
**Unidad Curricular:** Programación III  
**Docente:** Valentino Arballo  
**Fecha de Entrega:** 5/11/2026  

# Examen Final Integrador 2026

## Objetivo

Desarrollar una aplicación web con Next.js (App Router) que consuma la API REST desarrollada por el grupo en Ingeniería de Software (Django + django-rest-framework). Se evaluará el enrutamiento avanzado, el renderizado mixto (Server y Client Components), los formularios validados, la gestión de estado global, el testing unitario, la autenticación contra la API y el despliegue de la aplicación.

## Modalidad

* El examen se trabaja en grupos de hasta 4 personas. El grupo debe ser el mismo que en el EFI de Ingeniería de Software.
* La nota final surge del promedio entre la nota de este EFI (Frontend) y la del EFI de Ingeniería de Software (Back). Cada proyecto es evaluado individualmente por su docente.
* La API que consuma la aplicación debe ser obligatoriamente la desarrollada por el grupo para Ingeniería de Software.
* Se usarán horas de clase para el desarrollo y el docente queda a disposición para consultas.
* El examen se defiende oralmente: se muestra el proyecto en funcionamiento y se responden preguntas sobre el código y las decisiones arquitectónicas tomadas.

## Temática e identidad

La temática y la identidad del sistema (por ejemplo, «Vivero Las Dalias») son las que el grupo eligió para el proyecto de Back en la planilla *Grupos EFI 2026 Ing. de Soft. / Prog. III*.  
El frontend debe reflejar esa identidad: nombre del proyecto, logo o marca, paleta de colores, textos y descripción en el README.

## Requisitos

### R1. Enrutamiento y layouts
* Al menos 6 rutas principales.
* Al menos 1 ruta anidada, usando el sistema de carpetas de Next.js.
* Al menos 2 rutas dinámicas que reciban parámetros por URL (ej.: `/productos/[id]`, `/dashboard/editar/[slug]`).
* Navegación interna con el componente `<Link>` de Next.js.
* Un `layout.tsx` raíz y al menos 1 layout anidado que envuelva una sección específica.
* Páginas de `not-found` y manejo de estados de carga y error (`loading.jsx` / `error.tsx`) en al menos una sección.

### R2. Arquitectura de componentes
* Mínimo de 8 componentes reutilizables (sin contar las páginas).
* Uso justificado de ambos paradigmas: al menos 1 Server Component y al menos 1 Client Component (`"use client"`). En la defensa se debe explicar por qué cada componente es de un tipo u otro.

### R3. Integración con la API y CRUD
* Consumo de la API propia del grupo mediante `fetch` o la herramienta de fetching de su preferencia.
* Las 4 operaciones del CRUD (crear, leer, editar y borrar) funcionando sobre al menos 1 recurso principal.
* Al menos 1 listado con búsqueda y/o filtros que aproveche lo que expone el Back.
* Manejo visible de estados de carga y de error en las llamadas a la API.

### R4. Autenticación
* Pantalla de login que obtenga un token desde la API del Back, y cierre de sesión.
* Las operaciones protegidas deben enviar el token. Las rutas que requieran sesión deben estar protegidas en el frontend (redirigiendo al login si no hay sesión).

### R5. Formularios y validaciones
* Formularios controlados con React Hook Form.
* Validación con Zod (campos obligatorios, tipos de datos, formato, longitud, etc.), integrada mediante el resolver de RHF.
* Al menos 2 formularios distintos (por ejemplo, login y alta/edición del recurso principal), mostrando los errores de validación al usuario y los errores devueltos por la API.

### R6. Estado global con Context API
* Uso de `createContext` y `useContext` para compartir información global entre componentes cliente.
* Ejemplo sugerido: selector de tema claro/oscuro. También puede usarse para la sesión del usuario.

### R7. Testing unitario
* Configuración de Vitest.
* Al menos 4 tests unitarios que pasen exitosamente (componentes, funciones utilitarias o esquemas de validación).

### R8. Despliegue
* Aplicación desplegada y funcional el día de la defensa (Vercel recomendado, o el hosting que prefiera el grupo).
* Variables de entorno correctamente configuradas para producción (por ejemplo, la URL base de la API).
* Para que la aplicación desplegada funcione, la API del Back debe estar accesible públicamente (no puede apuntar a `localhost`). Coordinar este punto con el equipo de Back.

## Condiciones de entrega

* Documentar el desarrollo con una herramienta de metodología ágil (tablero Kanban en Trello o GitHub Projects) con tareas asignadas a los integrantes.
* Estilos con Tailwind CSS.
* Código en JavaScript o TSX, con la lógica separada en componentes modulares y reutilizables.
* Repositorio en GitHub con ramas siguiendo GitFlow (`main`, `develop` y ramas `feature/*`), commits descriptivos y pull requests.
* El `README.md` debe incluir:
  * Título de la aplicación.
  * Breve descripción de la temática elegida y enlace a la documentación o repositorio de la API de Ingeniería de Software que se consume.
  * Pasos para ejecutar la aplicación localmente (`npm install`, `npm run dev`) y variables de entorno necesarias.
  * Pasos para correr los tests (`npm run test`).
  * Enlace a la aplicación desplegada y al tablero Kanban.
  * Capturas de la aplicación en funcionamiento.
  * Nombres y apellidos de los integrantes.

## Fechas

* Entrega del Back (Ingeniería de Software): lunes 2 de noviembre.
* Entrega del Front (Programación III): jueves 5 de noviembre.
* Las defensas se coordinarán a partir de la fecha de entrega.

---

## Alternativa: desarrollo en Astro

El grupo puede optar por desarrollar todo el frontend en **Astro** en lugar de Next.js. Se mantienen la modalidad, los requisitos, las condiciones de entrega y las fechas de este documento, con las equivalencias que se detallan a continuación. Se elige un solo framework por proyecto: no se pueden mezclar Next.js y Astro.

### Equivalencias por requisito

* **R1. Enrutamiento y layouts:** las rutas se definen con archivos en `src/pages`, con las mismas cantidades (6 rutas principales, 1 anidada y 2 dinámicas, por ejemplo `[id].astro` o `[slug].astro`). Como los datos vienen de la API en tiempo de ejecución, las rutas dinámicas deben renderizarse bajo demanda (modo servidor con adaptador). En lugar de `<Link>`, la navegación interna se hace con enlaces `<a>` entre páginas (con View Transitions). Se piden un layout raíz, una página `404.astro` y manejo de estados de carga y error en al menos una sección.
* **R2. Arquitectura de componentes:** mínimo de 8 componentes reutilizables (`.astro` o de un framework de UI), sin contar las páginas. En lugar de Server y Client Components, se pide el uso justificado de:
  * al menos 1 isla de servidor (*server island*, directiva `server:defer`, con su contenido de reemplazo `slot="fallback"`);
  * al menos 1 isla de cliente (directiva `client:*`, por ejemplo `client:load` o `client:visible`).
  En la defensa se debe explicar qué se renderiza en cada lugar y por qué.
* **R3. Integración con la API y hacer un CRUD:** las mismas operaciones que en Next.js. La lectura puede hacerse con `fetch` en el frontmatter de las páginas y componentes `.astro`, crear, editar y borrar pueden resolverse con `fetch` desde islas de cliente, endpoints de Astro o Astro Actions.
* **R4. Autenticación:** igual que en Next.js. Para proteger rutas agregar un middleware que lea la sesión y redirija al login si no existe.
* **R5. Formularios y validaciones:** se mantienen React Hook Form y Zod. Los formularios se implementan como islas de React (`@astrojs/react`).
* **R6. Estado global con Context API:** se mantiene el uso de `createContext` y `useContext`, dentro de islas de React. Cada isla es un árbol independiente, por lo que un contexto solo se comparte entre los componentes de una misma isla: el grupo debe diseñar la isla raíz que contiene el árbol interactivo (por ejemplo, con un `ThemeProvider`) teniendo esto en cuenta.
* **R7. Testing unitario:** se mantiene Vitest, con al menos 4 tests unitarios que pasen exitosamente.
* **R8. Despliegue:** igual que en Next.js. Como se usan rutas dinámicas e islas de servidor, el proyecto necesita un adaptador de servidor (Vercel) y las variables de entorno configuradas para producción.

### Condiciones de entrega (Astro)
Se mantienen todas las condiciones de entrega: Tailwind CSS, Kanban, GitFlow y README. En el README se debe aclarar que el proyecto está desarrollado en Astro.