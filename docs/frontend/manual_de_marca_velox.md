# VELOX
## MANUAL DE IDENTIDAD VISUAL Y UI

### Concepto Core
Velox nace en la intersección entre el rendimiento deportivo y la tecnología pura. La marca está diseñada para comunicar velocidad, avance y precisión a través de una interfaz oscura, técnica y minimalista.

---

### Identidad de Marca

#### El Manifiesto
Velocidad sin fricción. Rendimiento en cada paso. Diseñado para el movimiento.

Nuestra misión visual es eliminar el ruido. Un e-commerce de calzado deportivo donde el producto es el único protagonista y la navegación se siente tan fluida como el calzado que vendemos. El "Modo Oscuro" no es una opción, es el estado natural de la marca.

#### Tono de Voz en la UI
El copywriting en los botones, modales y descripciones debe ser directo, enérgico y técnico. Evitamos palabras pasivas. En lugar de "Ver detalles", usamos "Analizar rendimiento". En lugar de "Comprar", usamos "Acelerar" o "Adquirir".

*Velox Brand Guidelines - Página 1*

---

### Sistema de Logotipo
El logotipo principal está construido tipográficamente (Wordmark). La X final en color verde neón es el elemento distintivo de la marca.

**VELOX**

#### Área de Respeto (Clear Space)
Para asegurar la correcta lectura en la barra de navegación (Navbar), el logotipo debe mantener un margen de respiro equivalente al ancho de la letra "O" en todos sus lados.

#### Usos Incorrectos
* Nunca alterar la proporción ni estirar la tipografía.
* No aplicar colores fuera de la paleta oficial.
* El logo no debe ser utilizado sobre fondos blancos sin adaptar la tipografía principal a color Carbón.

---

### Sistema Tipográfico
Para el desarrollo del frontend, utilizaremos tipografías de Google Fonts: *Space Grotesk* para titulares y peso visual, e *Inter* para el cuerpo y componentes.

* **H1 / SPACE GROTESK BOLD**
  * Uso: Títulos del Hero Section, grandes enunciados.
* **H2 / SPACE GROTESK SEMIBOLD**
  * Uso: Nombres de zapatillas, títulos de sección.
* **Body / Inter Regular**
  * Uso: Descripciones de producto, párrafos largos, inputs de formulario.

*Velox Brand Guidelines - Página 2*

---

### Paleta Cromática (Tokens de UI)
Estos son los valores exactos para configurar en Tailwind CSS o las variables nativas de CSS.

* **Base:** `#121212`
* **Surface:** `#2A2A2A`
* **Accent:** `#39FF14`
* **Text 1:** `#FFFFFF`
* **Text 2:** `#D1D5DB`

---

### Componentes Visuales y Estructura UI
Directrices para la construcción de los componentes en React/Next.js.

#### Botones (CTAs)
Los botones primarios deben utilizar el color Accent (Verde Neón) como fondo, con texto en color Base (Carbón) utilizando tipografía Inter Bold en mayúsculas.
*(Ejemplo: AÑADIR AL CARRITO)*

#### Product Cards
Las tarjetas de producto utilizan el color Surface (`#2A2A2A`) con un border-radius estricto de 8px (`rounded-lg`). Evitar sombras difusas tradicionales; mantener un aspecto sólido y limpio.

---

### Dirección de Fotografía
Todo el calzado debe presentarse aislado (cut-out) en formato PNG con fondo transparente. Las fotografías deben poseer una iluminación técnica de estudio (luz dura y sombras proyectadas nítidas) para resaltar las texturas de la malla, las suelas y las tecnologías de cada zapatilla. Para destacar productos en el hero, se recomienda aplicar un resplandor (glow) sutil utilizando el color de acento por detrás del render del producto.

*Velox Brand Guidelines - Página 3*