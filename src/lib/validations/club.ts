import { z } from "zod";

export const ClubSchema = z.object({
  nombre: z.string().min(1),
  slug: z.string().min(1),
  escudo: z.string().url().nullable().optional(),
  paisId: z.string().min(1),
  ligaId: z.string().min(1),
});
