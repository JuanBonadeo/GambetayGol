import { z } from "zod";

export const OfferSchema = z.object({
  productId: z.string().nullable().optional(),
  variantId: z.string().nullable().optional(),
  tipo: z.enum(["PORCENTAJE", "MONTO_FIJO"]),
  descuento: z.number().positive(),
  descripcion: z.string().nullable().optional(),
  activo: z.boolean().default(true),
  desde: z.coerce.date(),
  hasta: z.coerce.date(),
}).refine(data => data.desde < data.hasta, {
  message: "La fecha de inicio debe ser anterior a la fecha de fin",
  path: ["desde"]
}).refine(data => data.productId || data.variantId, {
  message: "Debe estar asociado a un producto o una variante",
  path: ["productId"]
});
