import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "../../components/Modal";

describe("Modal Component (R2) - Diálogo Reutilizable y Accesibilidad", () => {
  it("no renderiza nada cuando isOpen es false", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Contenido Oculto</p>
      </Modal>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza el título y contenido cuando isOpen es true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="CONFIRMAR PEDIDO">
        <p>¿Deseas enviar el pedido a DRF?</p>
      </Modal>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("CONFIRMAR PEDIDO")).toBeInTheDocument();
    expect(screen.getByText("¿Deseas enviar el pedido a DRF?")).toBeInTheDocument();
  });

  it("invoca la función onClose al hacer click en el botón de cerrar", () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="MODAL DE PRUEBA">
        <p>Texto</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText("Cerrar ventana modal");
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("invoca onClose al presionar la tecla Escape", () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="MODAL ESCAPE">
        <p>Texto</p>
      </Modal>
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
