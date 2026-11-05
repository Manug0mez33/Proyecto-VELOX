import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "../../components/ProductCard";
import { CartProvider } from "../../context/CartContext";

const MOCK_PRODUCTO = {
  id: 1,
  nombre: "VELOX AERO NITRO ELITE",
  marca_detalle: { nombre: "VELOX Performance" },
  categoria_detalle: { nombre: "Running" },
  genero: "UNISEX",
  precio_base: "189500.00",
  sku_referencia: "VLX-AER-41-NEO",
  stock_total: 14,
  es_destacado: true,
  descripcion: "Suela de carbono propulsiva y amortiguación Nitro-Foam.",
  variantes: [
    { id: 101, sku: "VLX-AER-40-NEO", talle: "40", stock: 3, color: "Neón", precio_ajustado: null },
    { id: 102, sku: "VLX-AER-41-NEO", talle: "41", stock: 5, color: "Neón", precio_ajustado: null },
    { id: 103, sku: "VLX-AER-42-NEO", talle: "42", stock: 4, color: "Neón", precio_ajustado: "195000.00" },
  ],
};

describe("Prueba de componente: ProductCard (R2)", () => {
  it("renderiza correctamente los datos y permite seleccionar talle actualizando el precio", () => {
    render(
      <CartProvider>
        <ProductCard producto={MOCK_PRODUCTO} />
      </CartProvider>
    );

    // Verificar renderizado inicial
    expect(screen.getByText("VELOX AERO NITRO ELITE")).toBeInTheDocument();
    expect(screen.getByText(/\$189\.500/i)).toBeInTheDocument();

    // Simular selección de talle 42
    const botonTalle42 = screen.getByRole("button", { name: /Seleccionar talle 42/i });
    fireEvent.click(botonTalle42);

    // Validar actualización reactiva de SKU y precio ajustado
    expect(screen.getByText(/SKU: VLX-AER-42-NEO/i)).toBeInTheDocument();
    expect(screen.getByText(/\$195\.000/i)).toBeInTheDocument();
  });
});
