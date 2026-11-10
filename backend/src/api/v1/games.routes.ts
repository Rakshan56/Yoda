import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data, page } from "../../lib/response.js";
import { paginate } from "../../lib/pagination.js";
import { gameId, paginatedQuery } from "../schemas/common.js";
import { validate } from "../middleware/validate.js";
import { notFound } from "../../lib/errors.js";
export const gamesRouter = Router();
gamesRouter.get("/", validate(z.object({ query: paginatedQuery })), async (req, res, next) => {
  try {
    const q = req.query as unknown as { page: number; page_size: number; search?: string };
    const where = q.search ? { isActive: true, OR: [{ id: { contains: q.search, mode: "insensitive" as const } }, { name: { contains: q.search, mode: "insensitive" as const } }] } : { isActive: true };
    const [items, total] = await prisma.$transaction([prisma.game.findMany({ where, include: { region: true }, skip: (q.page - 1) * q.page_size, take: q.page_size, orderBy: { id: "asc" } }), prisma.game.count({ where })]);
    return page(res, items.map(gameDto), paginate(q.page, q.page_size, total));
  } catch (error) { next(error); }
});
gamesRouter.get("/:gameId", validate(z.object({ params: z.object({ gameId }) })), async (req, res, next) => {
  try { const game = await prisma.game.findUnique({ where: { id: String(req.params.gameId) }, include: { region: true } }); if (!game) throw notFound(); return data(res, gameDto(game)); } catch (error) { next(error); }
});
gamesRouter.get("/:gameId/overview", validate(z.object({ params: z.object({ gameId }) })), async (req, res, next) => {
  try { const game = await prisma.game.findUnique({ where: { id: String(req.params.gameId) }, include: { region: true, _count: { select: { gamePokemon: true, locations: true, walkthroughChapters: true, battles: true } } } }); if (!game) throw notFound(); return data(res, { ...gameDto(game), counts: (game as typeof game & { _count: Record<string, number> })._count, completeness: "partial" }); } catch (error) { next(error); }
});
const gameDto = (game: any) => ({ id: game.id, name: game.name, generation: game.generation, platform: game.platform, region: game.region, release_year: game.releaseYear, version_group: game.versionGroup, box_art_url: game.boxArtUrl, description: game.description, is_active: game.isActive });
