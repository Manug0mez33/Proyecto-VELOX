"use client";
// Client Component ("use client"): Utiliza usePathname, useState y lectura reactiva del carrito para resaltar la ruta activa, abrir el menú móvil y mostrar el contador de items en tiempo real.

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
  { href: "/", label: "INICIO" },
  { href: "/productos", label: "CATÁLOGO" },
  { href: "/tecnologia", label: "TECNOLOGÍA" },
  { href: "/dashboard", label: "DASHBOARD" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems: cartCount } = useCart();



  return (
    <header className="sticky top-0 z-50 w-full bg-[#121212]/95 backdrop-blur border-b border-[#2A2A2A]">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-20">
        {/* Wordmark Oficial VELOX con área de respeto equivalente a la letra O */}
        <Link
          href="/"
          className="py-2 pr-4 font-heading text-2xl sm:text-[28px] font-extrabold tracking-[0.15em] text-[#FFFFFF] select-none"
          aria-label="VELOX Inicio"
        >
          VELO<span className="text-[#39FF14]">X</span>
        </Link>

        {/* Enlaces de navegación principales (R1) */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-2 text-xs lg:text-sm font-semibold tracking-wider transition-colors ${
                  isActive
                    ? "text-[#39FF14]"
                    : "text-[#D1D5DB] hover:text-[#FFFFFF]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#39FF14]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Acciones Derecha: Login (/login) y Carrito (/carrito) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] px-5 text-xs font-bold uppercase tracking-wider text-[#FFFFFF] transition-colors hover:border-[#39FF14] hover:text-[#39FF14]"
          >
            ACCEDER
          </Link>
          <Link
            href="/carrito"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#39FF14] px-5 text-xs font-extrabold uppercase tracking-wider text-[#121212] transition-transform hover:brightness-110 active:scale-95"
          >
            CARRITO ({cartCount})
          </Link>
        </div>

        {/* Botón Menú Móvil */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex md:hidden items-center justify-center rounded-lg bg-[#2A2A2A] p-2.5 text-[#FFFFFF] hover:text-[#39FF14]"
          aria-label="Abrir menú de navegación"
        >
          <span className="font-mono text-sm font-bold">
            {mobileMenuOpen ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {/* Panel Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2A2A2A] bg-[#121212] px-6 py-4 space-y-3">
          <div className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 text-sm font-semibold ${
                    isActive ? "text-[#39FF14]" : "text-[#D1D5DB]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="flex gap-3 pt-3 border-t border-[#2A2A2A]">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center rounded-lg bg-[#2A2A2A] py-2.5 text-xs font-bold uppercase text-[#FFFFFF]"
            >
              ACCEDER
            </Link>
            <Link
              href="/carrito"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center rounded-lg bg-[#39FF14] py-2.5 text-xs font-extrabold uppercase text-[#121212]"
            >
              CARRITO ({cartCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
