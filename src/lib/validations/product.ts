import { z } from "zod";

export const ProductSchema = z.object({
  nombre: z.string().min(1),
  slug: z.string().min(1),
  descripcion: z.string().nullable().optional(),
  categoria: z.enum(["Fan", "Jugador", "Retro"]),
  precio: z.number().min(0),
  destacado: z.boolean().default(false),
  bajoPedido: z.boolean().default(false),
  activo: z.boolean().default(true),
  clubId: z.string().min(1),
  variants: z.array(z.object({
    talla: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]),
    stock: z.number().min(0).default(0),
    sku: z.string().min(1),
    bajoPedido: z.boolean().default(false),
  })).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    orden: z.number().default(0),
    esPrincipal: z.boolean().default(false),
  })).optional(),
});
