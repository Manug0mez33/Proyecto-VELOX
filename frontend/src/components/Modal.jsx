"use client";
// Client Component ("use client"): Gestiona el estado interactivo de apertura, cierre con tecla Escape, clic en backdrop y bloqueo de scroll del navegador para diálogos y confirmaciones.

import { useEffect, useCallback } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  // Manejo de la tecla Escape para accesibilidad
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // Bloquear el scroll del body mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop oscuro con blur y click para cerrar */}
      <div
        className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tarjeta del Modal con estética VELOX */}
      <div
        className={`relative z-10 w-full ${sizeClasses[size] || sizeClasses.md} overflow-hidden rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] shadow-[0_0_40px_rgba(0,0,0,0.85)] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4 bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#39FF14]" />
            <h3
              id="modal-title"
              className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-[#FFFFFF]"
            >
              {title || "VENTANA MODAL"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#2A2A2A] hover:text-[#39FF14] transition-colors focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
            aria-label="Cerrar ventana modal"
          >
            <span className="text-xl font-bold leading-none">&times;</span>
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="px-6 py-5 text-sm text-[#D1D5DB] leading-relaxed max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Pie del Modal (opcional) */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[#2A2A2A] px-6 py-4 bg-[#181818]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
