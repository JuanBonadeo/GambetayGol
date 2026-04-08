import { z } from "zod";

export const LigaSchema = z.object({
  nombre: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().url().nullable().optional(),
  paisId: z.string().min(1),
});
