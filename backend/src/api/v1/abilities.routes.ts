import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data, page } from "../../lib/response.js";
import { paginate } from "../../lib/pagination.js";
import { notFound } from "../../lib/errors.js";
import { validate } from "../middleware/validate.js";
import { paginatedQuery } from "../schemas/common.js";
export const abilitiesRouter = Router();
abilitiesRouter.get("/", validate(z.object({ query: paginatedQuery })), async (req, res, next) => {
  try {
    const q = req.query as unknown as { page: number; page_size: number; search?: string };
    const where = q.search ? { name: { contains: q.search, mode: "insensitive" as const } } : {};
    const [items, total] = await prisma.$transaction([prisma.ability.findMany({ where, skip: (q.page - 1) * q.page_size, take: q.page_size, orderBy: { name: "asc" } }), prisma.ability.count({ where })]);
    return page(res, items.map(abilityDto), paginate(q.page, q.page_size, total));
  } catch (error) { next(error); }
});
abilitiesRouter.get("/:abilityId", async (req, res, next) => {
  try { const ability = await prisma.ability.findUnique({ where: { id: String(req.params.abilityId) } }); if (!ability) throw notFound("Ability not found."); return data(res, abilityDto(ability)); } catch (error) { next(error); }
});
const abilityDto = (ability: any) => ({ id: ability.id, name: ability.name, effect: ability.effect, short_effect: ability.shortEffect });
