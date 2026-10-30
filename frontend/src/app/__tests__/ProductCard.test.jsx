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

describe("ProductCard Component (Requisito R2 y R7)", () => {
  it("renderiza correctamente el nombre, marca, precio y SKU del producto", () => {
    render(
      <CartProvider>
        <ProductCard producto={MOCK_PRODUCTO} />
      </CartProvider>
    );

    expect(screen.getByText("VELOX AERO NITRO ELITE")).toBeInTheDocument();
    expect(screen.getByText(/VELOX Performance/i)).toBeInTheDocument();
    expect(screen.getByText(/\$189\.500/i)).toBeInTheDocument();
    expect(screen.getByText(/SKU: VLX-AER-40-NEO/i)).toBeInTheDocument();
    expect(screen.getByText("★ DESTACADO")).toBeInTheDocument();
  });

  it("permite cambiar de talle y actualiza el SKU y precio correspondiente", () => {
    render(
      <CartProvider>
        <ProductCard producto={MOCK_PRODUCTO} />
      </CartProvider>
    );

    const botonTalle42 = screen.getByRole("button", { name: /Seleccionar talle 42/i });
    fireEvent.click(botonTalle42);

    expect(screen.getByText(/SKU: VLX-AER-42-NEO/i)).toBeInTheDocument();
    expect(screen.getByText(/\$195\.000/i)).toBeInTheDocument();
  });

  it("permite hacer click en COMPRAR y actualiza el estado a AGREGADO", () => {
    render(
      <CartProvider>
        <ProductCard producto={MOCK_PRODUCTO} />
      </CartProvider>
    );

    const botonComprar = screen.getByRole("button", { name: "COMPRAR" });
    fireEvent.click(botonComprar);

    expect(screen.getByText(/¡AGREGADO!/i)).toBeInTheDocument();
  });
});
