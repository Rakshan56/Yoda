import { z } from "zod";
import { paginationSchema } from "../../lib/pagination.js";
export const gameId = z
  .string()
  .regex(/^(firered|leafgreen|ruby|sapphire|emerald)$/);
export const paginatedQuery = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
});
