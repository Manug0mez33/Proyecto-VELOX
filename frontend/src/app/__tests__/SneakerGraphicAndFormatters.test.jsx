import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SneakerGraphic, { isRealProductImage } from "../../components/SneakerGraphic";
import { formatARS, formatFecha, getPrecioUnitario } from "../../lib/formatters";
import OrderStatusBadge from "../../components/OrderStatusBadge";

describe("SneakerGraphic (Enfoque Híbrido: Imagen Real BD vs SVG Vectorial)", () => {
  it("1. isRealProductImage descarta URLs vacías o de placehold.co y acepta URLs reales", () => {
    expect(isRealProductImage(null)).toBe(false);
    expect(isRealProductImage("")).toBe(false);
    expect(isRealProductImage("https://placehold.co/600x600/1E1E1E/39FF14?text=Velox")).toBe(false);
    expect(isRealProductImage("https://cdn.velox.com.ar/calzado/carbon-x.webp")).toBe(true);
    expect(isRealProductImage("/images/zapatilla-real.png")).toBe(true);
  });

  it("2. Renderiza el SVG vectorial dinámico cuando no hay imagen real o es placehold.co", () => {
    const { container } = render(
      <SneakerGraphic
        variant="card"
        imagenUrl="https://placehold.co/600x600/1E1E1E/FFFFFF?text=Pegasus"
        esDestacado={true}
      />
    );
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("3. Renderiza etiqueta <img> con la URL de la BD cuando recibe una foto real válida y aplica viewAngle en variant detail", () => {
    const { rerender } = render(
      <SneakerGraphic
        variant="detail"
        imagenUrl="https://cdn.velox.com.ar/calzado/velox-carbon.jpg"
        label="Velox Carbon X"
        viewAngle={0}
      />
    );
    const img = screen.getByRole("img", { name: "Velox Carbon X" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://cdn.velox.com.ar/calzado/velox-carbon.jpg");

    rerender(
      <SneakerGraphic
        variant="detail"
        imagenUrl="https://cdn.velox.com.ar/calzado/velox-carbon.jpg"
        label="Velox Carbon X"
        viewAngle={2}
      />
    );
    expect(screen.getByRole("img", { name: "Velox Carbon X" }).style.transform).toBe("rotate(-4deg)");
  });

  it("4. Renderiza variantes vectoriales hero, detail y thumb con transformaciones CSS válidas según viewAngle", () => {
    const { container, rerender } = render(
      <SneakerGraphic variant="detail" viewAngle={2} accentColor="#39FF14" />
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg.style.transform).toBe("rotate(-4deg)");

    rerender(<SneakerGraphic variant="detail" viewAngle={1} accentColor="#39FF14" />);
    expect(container.querySelector("svg").style.transform).toBe("scale(-1, 1)");

    rerender(<SneakerGraphic variant="thumb" accentColor="#2563EB" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("Utilidades compartidas (formatters y OrderStatusBadge)", () => {
  it("5. formatARS formatea montos numéricos, strings y valores nulos en pesos argentinos", () => {
    expect(formatARS(249999)).toMatch(/^\$249\.999$/);
    expect(formatARS("119999.00")).toMatch(/^\$119\.999$/);
    expect(formatARS(null)).toBe("$0");
    expect(formatARS(undefined)).toBe("$0");
  });

  it("6. formatFecha maneja fechas vacías e inválidas de forma segura", () => {
    expect(formatFecha(null)).toBe("Reciente");
    expect(formatFecha(null, { fallback: "—" })).toBe("—");
    expect(formatFecha("fecha-invalida")).toBe("fecha-invalida");
    expect(formatFecha("2026-10-30T14:30:00Z")).toContain("2026");
  });

  it("7. getPrecioUnitario prioriza precio, luego precio_final y finalmente precio_base", () => {
    expect(getPrecioUnitario({ precio: "150000", precio_final: "140000" })).toBe(150000);
    expect(getPrecioUnitario({ precio_final: "140000", precio_base: "130000" })).toBe(140000);
    expect(getPrecioUnitario({ precio_base: "130000" })).toBe(130000);
    expect(getPrecioUnitario(null)).toBe(0);
  });

  it("8. OrderStatusBadge muestra el texto correspondiente a cada estado de pedido", () => {
    const { rerender } = render(<OrderStatusBadge estado="PAGADO" />);
    expect(screen.getByText("PAGADO")).toBeInTheDocument();

    rerender(<OrderStatusBadge estado="CANCELADO" />);
    expect(screen.getByText("CANCELADO")).toBeInTheDocument();

    rerender(<OrderStatusBadge estado="PENDIENTE" />);
    expect(screen.getByText("PENDIENTE")).toBeInTheDocument();
  });
});
