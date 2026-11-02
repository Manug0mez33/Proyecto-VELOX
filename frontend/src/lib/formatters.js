// Módulo utilitario compartido: Centraliza el formateo de moneda ARS y fechas en español de Argentina (es-AR) para evitar duplicación entre páginas y componentes.

/**
 * Formatea un valor numérico o cadena como moneda en Pesos Argentinos (ARS) sin decimales.
 *
 * @param {number|string} valor - Monto a formatear
 * @returns {string} Monto formateado (ej. "$189.999")
 */
export function formatARS(valor) {
  const num = Number(valor) || 0;
  return `$${num.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

/**
 * Formatea una cadena de fecha ISO al formato local de Argentina (es-AR).
 *
 * @param {string|Date} fechaStr - Fecha ISO o instancia Date
 * @param {object} [options] - Opciones de visualización
 * @param {boolean} [options.includeTime=false] - Si incluye hora y minutos
 * @param {"short"|"long"|"2-digit"|"numeric"} [options.month] - Formato del mes (si se omite y no hay includeTime, usa formato corto estándar dd/mm/yyyy)
 * @param {string} [options.fallback="Reciente"] - Texto de respaldo cuando no hay fecha válida
 * @returns {string} Fecha formateada
 */
export function formatFecha(fechaStr, options = {}) {
  const { includeTime = false, month, fallback = "Reciente" } = options;
  if (!fechaStr) return fallback;

  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) {
      return fallback === "" ? "" : String(fechaStr);
    }

    if (includeTime) {
      return d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: month || "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (month) {
      return d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month,
        year: "numeric",
      });
    }

    return d.toLocaleDateString("es-AR");
  } catch {
    return fallback === "" ? "" : String(fechaStr);
  }
}

/**
 * Obtiene el precio unitario numérico de un ítem del carrito o detalle de pedido.
 * CartContext almacena el precio en "precio", mientras que la API y tarjetas usan "precio_final" o "precio_base".
 *
 * @param {object} item - Ítem del carrito o producto
 * @returns {number} Precio unitario numérico
 */
export function getPrecioUnitario(item) {
  if (!item) return 0;
  return Number(item.precio ?? item.precio_final ?? item.precio_base) || 0;
}
