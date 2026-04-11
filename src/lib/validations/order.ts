import { z } from "zod";

export const TIPO_ENVIO_LABELS: Record<string, string> = {
  ROSARIO: "Rosario",
  ANDREANI_SUCURSAL: "Andreani Sucursal",
  ANDREANI_DOMICILIO: "Andreani Domicilio",
};

export const OrderItemInputSchema = z.object({
  variantId: z.string().min(1),
  precio: z.number().min(0),
  cantidad: z.number().int().min(1),
});

export const CreateOrderSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().optional().nullable(),
  tipoEnvio: z.enum(["ROSARIO", "ANDREANI_SUCURSAL", "ANDREANI_DOMICILIO"]),
  items: z.array(OrderItemInputSchema).min(1, "Debe tener al menos un ítem"),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["PENDIENTE", "CONFIRMADA", "ENTREGADA", "CANCELADA"]),
});

export const UpdateOrderSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().optional().nullable(),
  tipoEnvio: z.enum(["ROSARIO", "ANDREANI_SUCURSAL", "ANDREANI_DOMICILIO"]),
  items: z.array(z.union([
    z.object({
      esEncargo: z.literal(false).optional().default(false),
      variantId: z.string().min(1),
      precio: z.number().min(0),
      cantidad: z.number().int().min(1),
    }),
    z.object({
      esEncargo: z.literal(true),
      productId: z.string().min(1),
      talla: z.string().min(1),
      precio: z.number().min(0),
      cantidad: z.number().int().min(1),
    }),
  ])).min(1),
});
