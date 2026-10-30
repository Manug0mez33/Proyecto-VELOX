"use client";
// Client Component ("use client"): Permite manejar eventos interactivos onClick, estados disabled/loading y navegación o envío de formularios en el cliente.

import Link from "next/link";

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg px-6 py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#39FF14] text-[#121212] hover:brightness-110 active:scale-[0.99] shadow-[0_0_20px_rgba(57,255,20,0.2)]",
    secondary:
      "bg-[#2A2A2A] text-[#FFFFFF] border border-[#444444] hover:border-[#39FF14] hover:text-[#39FF14]",
    outline:
      "bg-transparent text-[#39FF14] border border-[#39FF14] hover:bg-[#39FF14] hover:text-[#121212]",
    danger:
      "bg-[#3B1D1D] text-[#F87171] border border-[#7F1D1D] hover:bg-[#7F1D1D] hover:text-white",
  };

  const combinedClassName = `${baseStyles} ${variants[variant] || variants.primary} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {children}
    </button>
  );
}
