import { describe, it, expect } from "vitest";
import { orderSchema, orderItemSchema } from "../../validations/orderSchema";

describe("orderSchema (R5) - Validación Zod para Pedidos y Checkout", () => {
  it("valida exitosamente un pedido completo con items y dirección en snake_case", () => {
    const validOrder = {
      direccion_envio: "Boulevard Roca 1234",
      ciudad: "Río Cuarto",
      codigo_postal: "5800",
      telefono_contacto: "3584998877",
      metodo_pago: "TARJETA",
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
      expect(result.data.metodo_pago).toBe("TARJETA");
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

  it("falla si el pedido no contiene ningún producto en items", () => {
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
