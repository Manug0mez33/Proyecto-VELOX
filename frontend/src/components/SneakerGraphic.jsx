// Server Component: Componente visual híbrido y sin estado que renderiza la fotografía real del calzado cuando existe una URL válida en base de datos, o genera dinámicamente la silueta vectorial SVG de VELOX cuando no hay imagen o es un placeholder de prueba.

/**
 * Determina si una URL de imagen corresponde a una fotografía real y no a un servicio de placeholder.
 *
 * @param {string|null|undefined} url - URL proveniente de ImagenProducto en DRF
 * @returns {boolean} true si es una imagen real utilizable
 */
export function isRealProductImage(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.includes("placehold.co") || trimmed.includes("placeholder.com")) {
    return false;
  }
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  );
}

export default function SneakerGraphic({
  variant = "card",
  imagenUrl = null,
  accentColor = "#39FF14",
  esDestacado = false,
  viewAngle = 0,
  label = "Silueta de calzado VELOX",
  className = "",
}) {
  // 1. Enfoque Híbrido: Si la base de datos provee una imagen real (no placehold.co), la mostramos
  if (isRealProductImage(imagenUrl)) {
    const sizeClasses =
      variant === "thumb"
        ? "h-12 w-12 object-contain"
        : variant === "card"
        ? "relative z-10 h-40 w-64 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
        : "relative z-10 max-h-[240px] w-full max-w-[420px] object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)]";

    return (
      <img
        src={imagenUrl}
        alt={label}
        className={`${sizeClasses} ${className}`.trim()}
        loading="lazy"
      />
    );
  }

  // 2. Fallback Vectorial Dinámico en un único punto de mantenimiento
  if (variant === "hero") {
    return (
      <svg
        viewBox="0 0 470 250"
        className={`relative z-10 w-full max-w-[430px] drop-shadow-[0_12px_28px_rgba(57,255,20,0.22)] ${className}`.trim()}
        role="img"
        aria-label={label}
      >
        <defs>
          <linearGradient id="shoeBody" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#383838" />
            <stop offset="50%" stopColor="#1F1F1F" />
            <stop offset="100%" stopColor="#121212" />
          </linearGradient>
        </defs>
        <ellipse cx="230" cy="230" rx="195" ry="14" fill="#090909" />
        <path
          d="M20 190 Q140 205 290 195 Q395 188 445 162 Q458 178 442 198 Q380 222 240 222 Q95 222 15 208 Z"
          fill={accentColor || "#39FF14"}
        />
        <path
          d="M35 188 L75 95 Q115 80 155 108 L245 65 Q275 58 295 85 L385 132 Q435 142 442 162 Q345 194 185 195 Q85 195 35 188 Z"
          fill="url(#shoeBody)"
          stroke="#4A4A4A"
          strokeWidth="2"
        />
        <path d="M125 145 L285 115 L265 135 L110 162 Z" fill="#39FF14" />
        <path
          d="M175 168 L335 142 L322 156 L165 178 Z"
          fill="#39FF14"
          fillOpacity="0.75"
        />
        <path
          d="M82 95 Q115 62 152 68 L175 102 Z"
          fill="#2A2A2A"
          stroke="#39FF14"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (variant === "detail") {
    const soleColor = accentColor === "#39FF14" ? "#39FF14" : "#444444";
    const angleTransform =
      viewAngle === 1
        ? "scale(-1, 1)"
        : viewAngle === 2
        ? "rotate(-4)"
        : undefined;

    return (
      <svg
        viewBox="0 0 480 260"
        className={`relative z-10 w-full max-w-[420px] drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)] transition-transform duration-300 ${className}`.trim()}
        style={angleTransform ? { transform: angleTransform } : undefined}
        role="img"
        aria-label={label}
      >
        <ellipse cx="240" cy="235" rx="200" ry="12" fill="#090909" />
        <path
          d="M30 190 Q150 205 300 195 Q405 188 455 162 Q468 178 452 198 Q390 222 250 222 Q105 222 25 208 Z"
          fill={soleColor}
        />
        <path
          d="M45 188 L85 95 Q125 80 165 108 L255 65 Q285 58 305 85 L395 132 Q445 142 452 162 Q355 194 195 195 Q95 195 45 188 Z"
          fill="#242424"
          stroke="#555555"
          strokeWidth="2"
        />
        <path d="M135 145 L295 115 L275 135 L120 162 Z" fill="#39FF14" />
        <path
          d="M185 168 L345 142 L332 156 L175 178 Z"
          fill="#39FF14"
          fillOpacity="0.7"
        />
        <path
          d="M92 95 Q125 62 162 68 L185 102 Z"
          fill="#1C1C1C"
          stroke="#39FF14"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (variant === "thumb") {
    return (
      <svg
        viewBox="0 0 340 160"
        className={`w-12 h-8 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${className}`.trim()}
        aria-hidden="true"
      >
        <path
          d="M45 125 L80 65 L150 72 L215 45 L285 88 L300 120 L45 125 Z"
          fill="#242424"
          stroke="#39FF14"
          strokeWidth="4"
        />
        <path
          d="M100 95 L190 75 L175 90 L85 110 Z"
          fill="#39FF14"
          fillOpacity="0.85"
        />
        <rect
          x="40"
          y="122"
          width="265"
          height="14"
          rx="6"
          fill={accentColor || "#39FF14"}
        />
      </svg>
    );
  }

  // Por defecto: variant === "card"
  return (
    <svg
      viewBox="0 0 340 160"
      className={`relative z-10 w-64 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105 ${className}`.trim()}
      aria-hidden="true"
    >
      <ellipse cx="170" cy="148" rx="140" ry="8" fill="#0A0A0A" />
      <path
        d="M45 125 L80 65 L150 72 L215 45 L285 88 L300 120 L45 125 Z"
        fill="#242424"
        stroke={esDestacado ? "#FFFFFF" : "#39FF14"}
        strokeWidth="2"
      />
      <path
        d="M100 95 L190 75 L175 90 L85 110 Z"
        fill="#39FF14"
        fillOpacity="0.8"
      />
      <rect
        x="40"
        y="122"
        width="265"
        height="13"
        rx="6"
        fill={accentColor || "#39FF14"}
      />
    </svg>
  );
}
