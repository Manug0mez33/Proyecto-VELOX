// Server Component: Etiqueta visual estática sin estado ni eventos de navegador para mostrar talles, categorías o disponibilidad de stock.

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "bg-[#121212] text-[#D1D5DB] border border-[#383838]",
    neon: "bg-[#39FF14] text-[#121212] font-extrabold",
    outline: "bg-[#182C15] text-[#39FF14] border border-[#39FF14]",
    danger: "bg-[#3B1D1D] text-[#F87171] border border-[#7F1D1D]",
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center justify-center rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${selectedVariant} ${className}`}
    >
      {children}
    </span>
  );
}
