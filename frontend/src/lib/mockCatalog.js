// Catálogo de contingencia centralizado: Unifica los datos de respaldo alineados al fixture oficial `catalogo_velox.json` del backend para cuando la API REST no está disponible.

export const MOCK_MARCAS = [
  { id: 1, nombre: "Nike" },
  { id: 2, nombre: "Adidas" },
  { id: 3, nombre: "Puma" },
  { id: 4, nombre: "Asics" },
  { id: 5, nombre: "VELOX Performance" },
];

export const MOCK_CATEGORIAS = [
  { id: 1, nombre: "Running" },
  { id: 2, nombre: "Training" },
  { id: 3, nombre: "Básquet" },
  { id: 4, nombre: "Trail" },
  { id: 5, nombre: "Urbano" },
];

export const TALLES_BASE = [
  { id: 1, numero: "38 AR" },
  { id: 2, numero: "39 AR" },
  { id: 3, numero: "40 AR" },
  { id: 4, numero: "41 AR" },
  { id: 5, numero: "42 AR" },
  { id: 6, numero: "43 AR" },
  { id: 7, numero: "44 AR" },
];

export const COLORES_BASE = [
  { id: 1, nombre: "Negro", hex: "#121212" },
  { id: 2, nombre: "Blanco", hex: "#FFFFFF" },
  { id: 3, nombre: "Verde Neón", hex: "#39FF14" },
  { id: 4, nombre: "Gris Carbón", hex: "#4B5563" },
  { id: 5, nombre: "Azul", hex: "#2563EB" },
];

// Modelos base del fixture `catalogo_velox.json` para selectores de administración
export const PRODUCTOS_CATALOGO = [
  { id: 1, nombre: "Air Zoom Pegasus 40" },
  { id: 2, nombre: "Ultraboost Light" },
  { id: 3, nombre: "Gel-Trabuco 12" },
  { id: 4, nombre: "Fuse 3.0" },
  { id: 5, nombre: "LeBron XXI" },
  { id: 6, nombre: "Velox Carbon X" },
  { id: 7, nombre: "Velox Street Run" },
];

// Variantes iniciales de demostración para el inventario administrativo (alineadas a `catalogo_velox.json`)
export const SAMPLE_VARIANTES = [
  {
    id: 44,
    sku: "VX-VCX-39-NEG",
    producto: 6,
    producto_nombre: "Velox Carbon X",
    talle: 2,
    talle_detalle: "39 AR",
    color: 1,
    color_nombre: "Negro",
    stock: 12,
    precio_ajustado: null,
    precio_final: "249999.00",
    activo: true,
  },
  {
    id: 54,
    sku: "VX-VSR-38-BLA",
    producto: 7,
    producto_nombre: "Velox Street Run",
    talle: 1,
    talle_detalle: "38 AR",
    color: 2,
    color_nombre: "Blanco",
    stock: 8,
    precio_ajustado: null,
    precio_final: "99999.00",
    activo: true,
  },
  {
    id: 49,
    sku: "VX-VSR-38-GRI",
    producto: 7,
    producto_nombre: "Velox Street Run",
    talle: 1,
    talle_detalle: "38 AR",
    color: 4,
    color_nombre: "Gris Carbón",
    stock: 5,
    precio_ajustado: null,
    precio_final: "99999.00",
    activo: true,
  },
];

// Reseñas de respaldo para moderación administrativa cuando el servidor no responde
export const SAMPLE_RESENAS = [
  {
    id: 101,
    usuario: 1,
    usuario_nombre: "atleta_maraton",
    producto: 6,
    producto_nombre: "Velox Carbon X",
    calificacion: 5,
    comentario: "Excelente retorno de energía con la placa de carbono en 21K.",
    creado_en: "2026-10-30T14:30:00Z",
  },
  {
    id: 102,
    usuario: 2,
    usuario_nombre: "corredor_trail",
    producto: 3,
    producto_nombre: "Gel-Trabuco 12",
    calificacion: 4,
    comentario: "Gran tracción en senderos de barro y piedra suelta.",
    creado_en: "2026-10-29T18:00:00Z",
  },
];

// Catálogo completo de contingencia (los 7 modelos del fixture + 5 modelos de serie competición)
export const MOCK_PRODUCTOS_CATALOGO = [
  {
    id: 1,
    nombre: "Air Zoom Pegasus 40",
    marca_detalle: { id: 1, nombre: "Nike" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "189999.00",
    sku_referencia: "NK-PEG40-41-NEG",
    stock_total: 38,
    es_destacado: true,
    descripcion:
      "Zapatilla de running versátil con unidad Zoom Air para entrenamientos diarios.",
    talles: ["40", "41", "42", "43"],
    talle_activo: "41",
    variantes: [
      { id: 1, sku: "NK-PEG40-40-NEG", talle: "40", stock: 13, color: "Negro", color_hex: "#000000" },
      { id: 2, sku: "NK-PEG40-41-NEG", talle: "41", stock: 14, color: "Negro", color_hex: "#000000" },
      { id: 3, sku: "NK-PEG40-42-NEG", talle: "42", stock: 0, color: "Negro", color_hex: "#000000" },
      { id: 4, sku: "NK-PEG40-43-NEG", talle: "43", stock: 1, color: "Negro", color_hex: "#000000" },
      { id: 5, sku: "NK-PEG40-40-BLA", talle: "40", stock: 1, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 6, sku: "NK-PEG40-41-BLA", talle: "41", stock: 2, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 7, sku: "NK-PEG40-42-BLA", talle: "42", stock: 3, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 8, sku: "NK-PEG40-43-BLA", talle: "43", stock: 4, color: "Blanco", color_hex: "#FFFFFF" },
    ],
  },
  {
    id: 2,
    nombre: "Ultraboost Light",
    marca_detalle: { id: 2, nombre: "Adidas" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "HOMBRE",
    precio_base: "229999.00",
    sku_referencia: "AD-UBL-42-NEG",
    stock_total: 36,
    es_destacado: true,
    descripcion:
      "Running de máxima devolución de energía con mediasuela Light BOOST.",
    talles: ["41", "42", "43", "44"],
    talle_activo: "42",
    variantes: [
      { id: 9, sku: "AD-UBL-41-NEG", talle: "41", stock: 6, color: "Negro", color_hex: "#000000" },
      { id: 10, sku: "AD-UBL-42-NEG", talle: "42", stock: 7, color: "Negro", color_hex: "#000000" },
      { id: 11, sku: "AD-UBL-43-NEG", talle: "43", stock: 8, color: "Negro", color_hex: "#000000" },
      { id: 12, sku: "AD-UBL-44-NEG", talle: "44", stock: 9, color: "Negro", color_hex: "#000000" },
      { id: 14, sku: "AD-UBL-42-GRI", talle: "42", stock: 1, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 15, sku: "AD-UBL-43-GRI", talle: "43", stock: 2, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 16, sku: "AD-UBL-44-GRI", talle: "44", stock: 3, color: "Gris Carbón", color_hex: "#2A2A2A" },
    ],
  },
  {
    id: 3,
    nombre: "Gel-Trabuco 12",
    marca_detalle: { id: 4, nombre: "Asics" },
    categoria_detalle: { id: 4, nombre: "Trail" },
    genero: "UNISEX",
    precio_base: "199999.00",
    sku_referencia: "AS-GTR12-42-GRI",
    stock_total: 72,
    es_destacado: false,
    descripcion:
      "Trail running con suela de alto agarre y amortiguación GEL.",
    talles: ["40", "41", "42", "43"],
    talle_activo: "42",
    variantes: [
      { id: 17, sku: "AS-GTR12-40-GRI", talle: "40", stock: 6, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 18, sku: "AS-GTR12-41-GRI", talle: "41", stock: 7, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 19, sku: "AS-GTR12-42-GRI", talle: "42", stock: 8, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 20, sku: "AS-GTR12-43-GRI", talle: "43", stock: 9, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 21, sku: "AS-GTR12-40-AZU", talle: "40", stock: 9, color: "Azul", color_hex: "#1E40AF" },
      { id: 22, sku: "AS-GTR12-41-AZU", talle: "41", stock: 10, color: "Azul", color_hex: "#1E40AF" },
      { id: 23, sku: "AS-GTR12-42-AZU", talle: "42", stock: 11, color: "Azul", color_hex: "#1E40AF" },
      { id: 24, sku: "AS-GTR12-43-AZU", talle: "43", stock: 12, color: "Azul", color_hex: "#1E40AF" },
    ],
  },
  {
    id: 4,
    nombre: "Fuse 3.0",
    marca_detalle: { id: 3, nombre: "Puma" },
    categoria_detalle: { id: 2, nombre: "Training" },
    genero: "MUJER",
    precio_base: "139999.00",
    sku_referencia: "PM-FUS3-39-NEG",
    stock_total: 40,
    es_destacado: false,
    descripcion:
      "Training para cargas pesadas con talón estable.",
    talles: ["38", "39", "40", "41"],
    talle_activo: "39",
    variantes: [
      { id: 25, sku: "PM-FUS3-38-NEG", talle: "38", stock: 2, color: "Negro", color_hex: "#000000" },
      { id: 26, sku: "PM-FUS3-39-NEG", talle: "39", stock: 3, color: "Negro", color_hex: "#000000" },
      { id: 27, sku: "PM-FUS3-40-NEG", talle: "40", stock: 4, color: "Negro", color_hex: "#000000" },
      { id: 28, sku: "PM-FUS3-41-NEG", talle: "41", stock: 5, color: "Negro", color_hex: "#000000" },
      { id: 29, sku: "PM-FUS3-38-BLA", talle: "38", stock: 5, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 30, sku: "PM-FUS3-39-BLA", talle: "39", stock: 6, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 31, sku: "PM-FUS3-40-BLA", talle: "40", stock: 7, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 32, sku: "PM-FUS3-41-BLA", talle: "41", stock: 8, color: "Blanco", color_hex: "#FFFFFF" },
    ],
  },
  {
    id: 5,
    nombre: "LeBron XXI",
    marca_detalle: { id: 1, nombre: "Nike" },
    categoria_detalle: { id: 3, nombre: "Básquet" },
    genero: "HOMBRE",
    precio_base: "279999.00",
    sku_referencia: "NK-LBJ21-42-NEG",
    stock_total: 33,
    es_destacado: false,
    descripcion:
      "Botita de básquet con soporte de tobillo y Zoom Turbo.",
    talles: ["42", "43", "44"],
    talle_activo: "42",
    variantes: [
      { id: 33, sku: "NK-LBJ21-42-NEG", talle: "42", stock: 13, color: "Negro", color_hex: "#000000" },
      { id: 34, sku: "NK-LBJ21-43-NEG", talle: "43", stock: 14, color: "Negro", color_hex: "#000000" },
      { id: 35, sku: "NK-LBJ21-44-NEG", talle: "44", stock: 0, precio_ajustado: "289999.00", color: "Negro", color_hex: "#000000" },
      { id: 36, sku: "NK-LBJ21-42-BLA", talle: "42", stock: 1, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 37, sku: "NK-LBJ21-43-BLA", talle: "43", stock: 2, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 38, sku: "NK-LBJ21-44-BLA", talle: "44", stock: 3, precio_ajustado: "289999.00", color: "Blanco", color_hex: "#FFFFFF" },
    ],
  },
  {
    id: 6,
    nombre: "Velox Carbon X",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "249999.00",
    sku_referencia: "VX-VCX-41-VER",
    stock_total: 70,
    es_destacado: true,
    descripcion:
      "Modelo insignia VELOX con placa de carbono para competencia.",
    talles: ["39", "40", "41", "42", "43"],
    talle_activo: "41",
    variantes: [
      { id: 39, sku: "VX-VCX-39-VER", talle: "39", stock: 8, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 40, sku: "VX-VCX-40-VER", talle: "40", stock: 9, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 41, sku: "VX-VCX-41-VER", talle: "41", stock: 10, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 42, sku: "VX-VCX-42-VER", talle: "42", stock: 11, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 43, sku: "VX-VCX-43-VER", talle: "43", stock: 12, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 44, sku: "VX-VCX-39-NEG", talle: "39", stock: 2, color: "Negro", color_hex: "#000000" },
      { id: 45, sku: "VX-VCX-40-NEG", talle: "40", stock: 3, color: "Negro", color_hex: "#000000" },
      { id: 46, sku: "VX-VCX-41-NEG", talle: "41", stock: 4, color: "Negro", color_hex: "#000000" },
      { id: 47, sku: "VX-VCX-42-NEG", talle: "42", stock: 5, color: "Negro", color_hex: "#000000" },
      { id: 48, sku: "VX-VCX-43-NEG", talle: "43", stock: 6, color: "Negro", color_hex: "#000000" },
    ],
  },
  {
    id: 7,
    nombre: "Velox Street Run",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 5, nombre: "Urbano" },
    genero: "UNISEX",
    precio_base: "99999.00",
    sku_referencia: "VX-VSR-41-BLA",
    stock_total: 70,
    es_destacado: false,
    descripcion:
      "Zapatilla urbana liviana inspirada en el running.",
    talles: ["38", "39", "40", "41", "42"],
    talle_activo: "41",
    variantes: [
      { id: 49, sku: "VX-VSR-38-GRI", talle: "38", stock: 2, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 50, sku: "VX-VSR-39-GRI", talle: "39", stock: 3, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 51, sku: "VX-VSR-40-GRI", talle: "40", stock: 4, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 52, sku: "VX-VSR-41-GRI", talle: "41", stock: 5, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 53, sku: "VX-VSR-42-GRI", talle: "42", stock: 6, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 54, sku: "VX-VSR-38-BLA", talle: "38", stock: 11, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 55, sku: "VX-VSR-39-BLA", talle: "39", stock: 12, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 56, sku: "VX-VSR-40-BLA", talle: "40", stock: 13, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 57, sku: "VX-VSR-41-BLA", talle: "41", stock: 14, color: "Blanco", color_hex: "#FFFFFF" },
      { id: 58, sku: "VX-VSR-42-BLA", talle: "42", stock: 0, color: "Blanco", color_hex: "#FFFFFF" },
    ],
  },
  {
    id: 8,
    nombre: "VELOX STRIDE TRAINING V1",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 2, nombre: "Training" },
    genero: "HOMBRE",
    precio_base: "145000.00",
    sku_referencia: "VLX-STR-42-GRY",
    stock_total: 12,
    es_destacado: false,
    descripcion:
      "Chasis plano y base ancha para levantamientos de fuerza y entrenamientos HIIT.",
    variantes: [
      { id: 801, sku: "VLX-STR-41-GRY", talle: "41", stock: 4, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 802, sku: "VLX-STR-42-GRY", talle: "42", stock: 5, color: "Gris Carbón", color_hex: "#2A2A2A" },
      { id: 803, sku: "VLX-STR-43-GRY", talle: "43", stock: 3, color: "Gris Carbón", color_hex: "#2A2A2A" },
    ],
  },
  {
    id: 9,
    nombre: "VELOX APEX HOOPS PRO",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 3, nombre: "Básquet" },
    genero: "UNISEX",
    precio_base: "192000.00",
    sku_referencia: "VLX-APX-43-NEO",
    stock_total: 7,
    es_destacado: false,
    descripcion:
      "Botita de media caña con contrafuerte rígido y placa torsional para cambios de dirección.",
    variantes: [
      { id: 901, sku: "VLX-APX-42-NEO", talle: "42", stock: 3, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 902, sku: "VLX-APX-43-NEO", talle: "43", stock: 4, color: "Verde Neón", color_hex: "#39FF14" },
    ],
  },
  {
    id: 10,
    nombre: "NIKE PEGASUS TRAIL 4",
    marca_detalle: { id: 1, nombre: "Nike" },
    categoria_detalle: { id: 4, nombre: "Trail" },
    genero: "HOMBRE",
    precio_base: "185000.00",
    sku_referencia: "NK-PEG-42-OLV",
    stock_total: 11,
    es_destacado: false,
    descripcion:
      "Híbrido asfalto-montaña con tracción generativa y protección contra piedras.",
    variantes: [
      { id: 1001, sku: "NK-PEG-41-OLV", talle: "41", stock: 5, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 1002, sku: "NK-PEG-42-OLV", talle: "42", stock: 6, color: "Verde Neón", color_hex: "#39FF14" },
    ],
  },
  {
    id: 11,
    nombre: "ADIDAS DROSET POWER LIFT",
    marca_detalle: { id: 2, nombre: "Adidas" },
    categoria_detalle: { id: 2, nombre: "Training" },
    genero: "UNISEX",
    precio_base: "162000.00",
    sku_referencia: "AD-DRO-41-BLK",
    stock_total: 8,
    es_destacado: false,
    descripcion:
      "Talón reforzado de densidad firme y drop mínimo para sentadillas y potencia.",
    variantes: [
      { id: 1101, sku: "AD-DRO-40-BLK", talle: "40", stock: 3, color: "Negro", color_hex: "#000000" },
      { id: 1102, sku: "AD-DRO-41-BLK", talle: "41", stock: 5, color: "Negro", color_hex: "#000000" },
    ],
  },
  {
    id: 12,
    nombre: "VELOX HYPERION CARBON X",
    marca_detalle: { id: 5, nombre: "VELOX Performance" },
    categoria_detalle: { id: 1, nombre: "Running" },
    genero: "UNISEX",
    precio_base: "219900.00",
    sku_referencia: "VLX-HYP-42-NEO",
    stock_total: 10,
    es_destacado: true,
    descripcion:
      "El buque insignia de VELOX: drop de 8.0mm, 168 gramos y placa bicapa de fibra de carbono.",
    variantes: [
      { id: 1201, sku: "VLX-HYP-40-NEO", talle: "40", stock: 2, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 1202, sku: "VLX-HYP-41-NEO", talle: "41", stock: 3, color: "Verde Neón", color_hex: "#39FF14" },
      { id: 1203, sku: "VLX-HYP-42-NEO", talle: "42", stock: 5, color: "Verde Neón", color_hex: "#39FF14" },
    ],
  },
];

// Destacados de respaldo para la Home (3 productos principales)
export const FALLBACK_DESTACADOS = [
  MOCK_PRODUCTOS_CATALOGO[5], // Velox Carbon X
  MOCK_PRODUCTOS_CATALOGO[0], // Air Zoom Pegasus 40
  MOCK_PRODUCTOS_CATALOGO[2], // Gel-Trabuco 12
];

/**
 * Busca un producto de respaldo por ID numérico cuando la API no responde.
 *
 * @param {number|string} id - ID del producto
 * @returns {object|null} Producto encontrado o null si está fuera de rango
 */
export function getMockProductoById(id) {
  const numId = Number(id);
  if (!numId || numId < 1) return null;

  const found = MOCK_PRODUCTOS_CATALOGO.find((p) => p.id === numId);
  if (found) return found;

  if (numId <= 12) {
    return {
      id: numId,
      nombre: `VELOX PERFORMANCE PRO SERIES #${numId}`,
      marca_detalle: { id: 5, nombre: "VELOX Performance" },
      categoria_detalle: { id: 1, nombre: "Competición" },
      genero: "UNISEX",
      precio_base: String(180000 + numId * 7500),
      sku_referencia: `VLX-SERIES-0${numId}`,
      descripcion:
        "Calzado deportivo de alta gama con chasis reforzado de fibra de carbono y suela biomecánica de retorno reactivo.",
      variantes: [
        { id: numId * 10 + 1, sku: `VLX-PRO-${numId}-40`, talle: "40", stock: 3, color: "Verde Neón", color_hex: "#39FF14" },
        { id: numId * 10 + 2, sku: `VLX-PRO-${numId}-41`, talle: "41", stock: 6, color: "Verde Neón", color_hex: "#39FF14" },
        { id: numId * 10 + 3, sku: `VLX-PRO-${numId}-42`, talle: "42", stock: 5, color: "Verde Neón", color_hex: "#39FF14" },
        { id: numId * 10 + 4, sku: `VLX-PRO-${numId}-43`, talle: "43", stock: 2, color: "Carbón", color_hex: "#121212" },
      ],
    };
  }

  return null;
}
