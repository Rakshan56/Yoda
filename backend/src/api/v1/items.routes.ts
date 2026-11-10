import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data, page } from "../../lib/response.js";
import { paginate } from "../../lib/pagination.js";
import { notFound } from "../../lib/errors.js";
import { validate } from "../middleware/validate.js";
import { paginatedQuery } from "../schemas/common.js";
export const itemsRouter = Router();
itemsRouter.get("/", validate(z.object({ query: paginatedQuery.extend({ category: z.string().optional() }) })), async (req, res, next) => {
  try {
    const q = req.query as unknown as { page: number; page_size: number; search?: string; category?: string };
    const where = { name: q.search ? { contains: q.search, mode: "insensitive" as const } : undefined, category: q.category };
    const [items, total] = await prisma.$transaction([prisma.item.findMany({ where, skip: (q.page - 1) * q.page_size, take: q.page_size, orderBy: { name: "asc" } }), prisma.item.count({ where })]);
    return page(res, items.map(itemDto), paginate(q.page, q.page_size, total));
  } catch (error) { next(error); }
});
itemsRouter.get("/:itemId", async (req, res, next) => {
  try { const item = await prisma.item.findUnique({ where: { id: String(req.params.itemId) }, include: { evolutions: true } }); if (!item) throw notFound("Item not found."); return data(res, itemDto(item)); } catch (error) { next(error); }
});
const itemDto = (item: any) => ({ id: item.id, name: item.name, category: item.category, effect: item.effect, evolution_count: item.evolutions?.length ?? 0 });
