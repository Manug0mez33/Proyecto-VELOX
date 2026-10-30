import { describe, it, expect } from "vitest";
import { orderSchema, orderItemSchema, checkoutFormSchema, METODOS_PAGO } from "../../validations/orderSchema";

describe("orderSchema (R5) - Validación Zod para Pedidos y Checkout", () => {
  describe("checkoutFormSchema (datos de formulario)", () => {
    it("acepta datos de contacto y entrega válidos con TRANSFERENCIA", () => {
      const validFormData = {
        direccion_envio: "Alvear 550",
        ciudad: "Río Cuarto",
        codigo_postal: "5800",
        telefono_contacto: "3584123456",
        metodo_pago: "TRANSFERENCIA",
        notas_adicionales: "Dejar en conserjería",
      };

      const result = checkoutFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ciudad).toBe("Río Cuarto");
        expect(result.data.metodo_pago).toBe("TRANSFERENCIA");
      }
    });

    it("acepta todos los métodos de pago oficiales de DRF Pedido.MetodoPago", () => {
      expect(METODOS_PAGO).toEqual([
        "TARJETA_CREDITO",
        "TARJETA_DEBITO",
        "TRANSFERENCIA",
        "EFECTIVO",
      ]);

      for (const metodo of METODOS_PAGO) {
        const formData = {
          direccion_envio: "Alvear 550",
          ciudad: "Río Cuarto",
          codigo_postal: "5800",
          telefono_contacto: "3584123456",
          metodo_pago: metodo,
        };
        const result = checkoutFormSchema.safeParse(formData);
        expect(result.success).toBe(true);
      }
    });

    it("falla si la dirección está vacía", () => {
      const invalid = {
        direccion_envio: "",
        ciudad: "Córdoba",
        codigo_postal: "5000",
        telefono_contacto: "3514223344",
        metodo_pago: "TARJETA_CREDITO",
      };

      const result = checkoutFormSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toContain("obligatoria");
    });
  });

  it("valida exitosamente un pedido completo con items y dirección en snake_case", () => {
    const validOrder = {
      direccion_envio: "Boulevard Roca 1234",
      ciudad: "Río Cuarto",
      codigo_postal: "5800",
      telefono_contacto: "3584998877",
      metodo_pago: "TARJETA_CREDITO",
      notas_adicionales: "Entregar en portería por la mañana.",
      items: [
        {
          variante_sku: "VLX-AER-41-NEO",
          variante_id: 10,
          nombre_producto: "VELOX AERO NITRO ELITE",
          cantidad: 2,
          precio_unitario: 189500,
        },
      ],
    };

    const result = orderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items).toHaveLength(1);
      expect(result.data.metodo_pago).toBe("TARJETA_CREDITO");
    }
  });

  it("valida exitosamente un pedido transaccional con array detalles para DRF", () => {
    const validDrfOrder = {
      direccion_envio: "Boulevard Roca 1234",
      ciudad: "Río Cuarto",
      codigo_postal: "5800",
      telefono_contacto: "3584998877",
      metodo_pago: "TARJETA_DEBITO",
      detalles: [
        {
          variante: 54,
          cantidad: 1,
        },
      ],
    };

    const result = orderSchema.safeParse(validDrfOrder);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.detalles).toHaveLength(1);
      expect(result.data.metodo_pago).toBe("TARJETA_DEBITO");
    }
  });

  it("falla si la dirección de envío tiene menos de 5 caracteres", () => {
    const invalidOrder = {
      direccion_envio: "Av.",
      ciudad: "Río Cuarto",
      codigo_postal: "5800",
      telefono_contacto: "3584998877",
      metodo_pago: "TRANSFERENCIA",
      items: [
        {
          variante_sku: "VLX-VOR-42",
          cantidad: 1,
          precio_unitario: 214000,
        },
      ],
    };

    const result = orderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("al menos 5 caracteres");
  });

  it("falla si el método de pago no pertenece a las opciones permitidas", () => {
    const invalidOrder = {
      direccion_envio: "San Lorenzo 789",
      ciudad: "Córdoba",
      codigo_postal: "5000",
      telefono_contacto: "3514223344",
      metodo_pago: "CRIPTO",
      items: [
        {
          variante_sku: "VLX-VOR-42",
          cantidad: 1,
          precio_unitario: 214000,
        },
      ],
    };

    const result = orderSchema.safeParse(invalidOrder);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("método de pago válido");
  });

  it("falla si el pedido no contiene ningún producto en items ni detalles", () => {
    const emptyItemsOrder = {
      direccion_envio: "San Lorenzo 789",
      ciudad: "Córdoba",
      codigo_postal: "5000",
      telefono_contacto: "3514223344",
      metodo_pago: "EFECTIVO",
      items: [],
    };

    const result = orderSchema.safeParse(emptyItemsOrder);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("al menos un producto");
  });

  it("valida que orderItemSchema rechace cantidades negativas o cero", () => {
    const invalidItem = {
      variante_sku: "VLX-SKU-99",
      cantidad: 0,
      precio_unitario: 15000,
    };

    const result = orderItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("mínima por producto es 1");
  });
});
