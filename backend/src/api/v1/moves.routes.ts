import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data, page } from "../../lib/response.js";
import { paginate } from "../../lib/pagination.js";
import { notFound } from "../../lib/errors.js";
import { validate } from "../middleware/validate.js";
import { paginatedQuery } from "../schemas/common.js";

export const movesRouter = Router();
movesRouter.get("/", validate(z.object({ query: paginatedQuery.extend({ type: z.string().optional(), generation: z.coerce.number().int().optional() }) })), async (req, res, next) => {
  try {
    const q = req.query as unknown as { page: number; page_size: number; search?: string; type?: string; generation?: number };
    const where = { name: q.search ? { contains: q.search, mode: "insensitive" as const } : undefined, generation: q.generation, typeId: q.type };
    const [items, total] = await prisma.$transaction([
      prisma.move.findMany({ where, include: { type: true }, skip: (q.page - 1) * q.page_size, take: q.page_size, orderBy: { name: "asc" } }),
      prisma.move.count({ where })
    ]);
    return page(res, items.map(moveDto), paginate(q.page, q.page_size, total));
  } catch (error) { next(error); }
});
movesRouter.get("/:moveId", async (req, res, next) => {
  try {
    const move = await prisma.move.findUnique({ where: { id: String(req.params.moveId) }, include: { type: true } });
    if (!move) throw notFound("Move not found.");
    return data(res, moveDto(move));
  } catch (error) { next(error); }
});
const moveDto = (move: any) => ({ id: move.id, name: move.name, type: move.type?.name, power: move.power, accuracy: move.accuracy, pp: move.pp, priority: move.priority, target: move.target, generation: move.generation, effect: move.effect });
