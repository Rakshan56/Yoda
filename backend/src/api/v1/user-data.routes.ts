import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data } from "../../lib/response.js";
import { AppError } from "../../lib/errors.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { gameId } from "../schemas/common.js";

export const userDataRouter = Router();
userDataRouter.use(authenticate);

const gameParams = z.object({ params: z.object({ gameId }) });
const collectionParams = z.object({ params: z.object({ gameId, pokemonId: z.string().min(1) }) });
const teamParams = z.object({ params: z.object({ teamId: z.string().uuid() }) });
const progressBody = z.object({ body: z.object({ status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETE"]) }) });
const collectionBody = z.object({ body: z.object({ status: z.enum(["SEEN", "CAUGHT", "OWNED", "WANTED"]), is_shiny: z.boolean().optional(), nickname: z.string().trim().max(40).nullable().optional(), notes: z.string().max(500).nullable().optional() }) });
const teamBody = z.object({ body: z.object({ game_id: gameId, name: z.string().trim().min(1).max(80), description: z.string().max(500).nullable().optional(), is_favorite: z.boolean().optional() }) });
const memberBody = z.object({ body: z.object({ pokemon_id: z.string().min(1), slot: z.number().int().min(1).max(6), level: z.number().int().min(1).max(100).nullable().optional(), nature: z.string().trim().max(30).nullable().optional(), is_shiny: z.boolean().optional() }) });

userDataRouter.get("/progress", async (req, res, next) => {
  try {
    const progress = await prisma.userGameProgress.findMany({ where: { userId: req.auth!.userId }, include: { game: true }, orderBy: { gameId: "asc" } });
    return data(res, progress.map((entry) => ({ game_id: entry.gameId, game_name: entry.game.name, status: entry.status, updated_at: entry.updatedAt })));
  } catch (error) { next(error); }
});

userDataRouter.put("/progress/:gameId", validate(z.object({ params: z.object({ gameId }), body: progressBody.shape.body })), async (req, res, next) => {
  try {
    const input = req.body as { status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" };
    const game = await prisma.game.findUnique({ where: { id: String(req.params.gameId) } });
    if (!game) throw new AppError(404, "RESOURCE_NOT_FOUND", "Game not found.");
    const result = await prisma.userGameProgress.upsert({ where: { userId_gameId: { userId: req.auth!.userId, gameId: game.id } }, update: { status: input.status }, create: { userId: req.auth!.userId, gameId: game.id, status: input.status } });
    return data(res, { game_id: result.gameId, status: result.status, updated_at: result.updatedAt });
  } catch (error) { next(error); }
});

userDataRouter.get("/:gameId/collection", validate(gameParams), async (req, res, next) => {
  try {
    const entries = await prisma.userCollection.findMany({ where: { userId: req.auth!.userId, gameId: String(req.params.gameId) }, include: { pokemon: true }, orderBy: { updatedAt: "desc" } });
    return data(res, entries.map((entry) => ({ id: entry.id, pokemon_id: entry.pokemonId, pokemon_name: entry.pokemon.name, status: entry.status, is_shiny: entry.isShiny, nickname: entry.nickname, notes: entry.notes, updated_at: entry.updatedAt })));
  } catch (error) { next(error); }
});

userDataRouter.put("/:gameId/collection/:pokemonId", validate(z.object({ params: z.object({ gameId, pokemonId: z.string().min(1) }), body: collectionBody.shape.body })), async (req, res, next) => {
  try {
    const input = req.body as { status: "SEEN" | "CAUGHT" | "OWNED" | "WANTED"; is_shiny?: boolean; nickname?: string | null; notes?: string | null };
    const pokemon = await prisma.pokemon.findUnique({ where: { id: String(req.params.pokemonId) } });
    const game = await prisma.game.findUnique({ where: { id: String(req.params.gameId) } });
    if (!pokemon || !game) throw new AppError(404, "RESOURCE_NOT_FOUND", "Game or Pokémon not found.");
    const entry = await prisma.userCollection.upsert({ where: { userId_gameId_pokemonId: { userId: req.auth!.userId, gameId: game.id, pokemonId: pokemon.id } }, update: { status: input.status, isShiny: input.is_shiny ?? false, nickname: input.nickname, notes: input.notes }, create: { userId: req.auth!.userId, gameId: game.id, pokemonId: pokemon.id, status: input.status, isShiny: input.is_shiny ?? false, nickname: input.nickname, notes: input.notes } });
    return data(res, entry);
  } catch (error) { next(error); }
});

userDataRouter.get("/teams", async (req, res, next) => {
  try { return data(res, await prisma.team.findMany({ where: { userId: req.auth!.userId }, include: { game: true, members: { include: { pokemon: true }, orderBy: { slot: "asc" } } }, orderBy: { updatedAt: "desc" } })); } catch (error) { next(error); }
});

userDataRouter.post("/teams", validate(teamBody), async (req, res, next) => {
  try {
    const input = req.body as { game_id: string; name: string; description?: string | null; is_favorite?: boolean };
    const game = await prisma.game.findUnique({ where: { id: input.game_id } });
    if (!game) throw new AppError(404, "RESOURCE_NOT_FOUND", "Game not found.");
    return data(res, await prisma.team.create({ data: { userId: req.auth!.userId, gameId: input.game_id, name: input.name, description: input.description, isFavorite: input.is_favorite ?? false } }), 201);
  } catch (error) { next(error); }
});

userDataRouter.delete("/teams/:teamId", validate(teamParams), async (req, res, next) => {
  try { const result = await prisma.team.deleteMany({ where: { id: String(req.params.teamId), userId: req.auth!.userId } }); if (!result.count) throw new AppError(404, "RESOURCE_NOT_FOUND", "Team not found."); return res.status(204).send(); } catch (error) { next(error); }
});

userDataRouter.post("/teams/:teamId/members", validate(z.object({ params: teamParams.shape.params, body: memberBody.shape.body })), async (req, res, next) => {
  try {
    const input = req.body as { pokemon_id: string; slot: number; level?: number | null; nature?: string | null; is_shiny?: boolean };
    const team = await prisma.team.findFirst({ where: { id: String(req.params.teamId), userId: req.auth!.userId } });
    const pokemon = await prisma.pokemon.findUnique({ where: { id: input.pokemon_id } });
    if (!team || !pokemon) throw new AppError(404, "RESOURCE_NOT_FOUND", "Team or Pokémon not found.");
    return data(res, await prisma.teamMember.upsert({ where: { teamId_slot: { teamId: team.id, slot: input.slot } }, update: { pokemonId: pokemon.id, level: input.level, nature: input.nature, isShiny: input.is_shiny ?? false }, create: { teamId: team.id, pokemonId: pokemon.id, slot: input.slot, level: input.level, nature: input.nature, isShiny: input.is_shiny ?? false } }), 201);
  } catch (error) { next(error); }
});
