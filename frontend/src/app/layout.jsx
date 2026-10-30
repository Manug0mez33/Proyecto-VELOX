// Server Component: Layout raíz que carga las tipografías oficiales (Space Grotesk e Inter), aplica el Modo Oscuro nativo (#121212) y estructura Navbar y Footer globales sin hidratar todo el árbol como cliente.

import { Space_Grotesk, Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CartProvider } from "../context/CartContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "VELOX — Calzado Deportivo de Alto Rendimiento",
  description:
    "Velocidad sin fricción. Rendimiento en cada paso. E-Commerce de calzado deportivo técnico con placa de carbono.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} dark`}
    >
      <body className="flex min-h-screen flex-col bg-[#121212] text-[#FFFFFF] antialiased selection:bg-[#39FF14] selection:text-[#121212]">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
