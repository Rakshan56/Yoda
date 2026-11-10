import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data, page } from "../../lib/response.js";
import { paginate } from "../../lib/pagination.js";
import { AppError, notFound } from "../../lib/errors.js";
import { validate } from "../middleware/validate.js";
import { gameId, paginatedQuery } from "../schemas/common.js";

export const gameContentRouter = Router();
const gameParams = z.object({ params: z.object({ gameId }) });
const locationParams = z.object({ params: z.object({ gameId, locationId: z.string().min(1) }) });
const chapterParams = z.object({ params: z.object({ gameId, chapterId: z.string().min(1) }) });
const battleParams = z.object({ params: z.object({ gameId, battleId: z.string().min(1) }) });
const questParams = z.object({ params: z.object({ gameId, questId: z.string().min(1) }) });

const published = "PUBLISHED" as const;
const ensureGame = async (id: string) => {
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) throw new AppError(404, "RESOURCE_NOT_FOUND", "Game not found.");
  return game;
};
const ensureLocation = async (gameId: string, id: string) => {
  const location = await prisma.location.findFirst({ where: { id, gameId } });
  if (!location) throw notFound("Location not found for this game.");
  return location;
};

gameContentRouter.get("/:gameId/locations", validate(z.object({ params: z.object({ gameId }), query: paginatedQuery })), async (req, res, next) => {
  try {
    await ensureGame(String(req.params.gameId));
    const q = req.query as unknown as { page: number; page_size: number; search?: string };
    const where = { gameId: String(req.params.gameId), name: q.search ? { contains: q.search, mode: "insensitive" as const } : undefined };
    const [items, total] = await prisma.$transaction([
      prisma.location.findMany({ where, skip: (q.page - 1) * q.page_size, take: q.page_size, orderBy: { name: "asc" } }),
      prisma.location.count({ where }),
    ]);
    return page(res, items.map(locationDto), paginate(q.page, q.page_size, total));
  } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/locations/:locationId", validate(locationParams), async (req, res, next) => {
  try {
    const location = await ensureLocation(String(req.params.gameId), String(req.params.locationId));
    return data(res, locationDto(location));
  } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/locations/:locationId/connections", validate(locationParams), async (req, res, next) => {
  try {
    await ensureLocation(String(req.params.gameId), String(req.params.locationId));
    const connections = await prisma.locationConnection.findMany({ where: { gameId: String(req.params.gameId), OR: [{ fromLocationId: String(req.params.locationId) }, { toLocationId: String(req.params.locationId) }] }, include: { fromLocation: true, toLocation: true }, orderBy: { connectionType: "asc" } });
    return data(res, connections.map((connection) => ({ id: connection.id, connection_type: connection.connectionType, unlock_condition: connection.unlockCondition, from: locationDto(connection.fromLocation), to: locationDto(connection.toLocation) })));
  } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/locations/:locationId/items", validate(locationParams), async (req, res, next) => {
  try {
    await ensureLocation(String(req.params.gameId), String(req.params.locationId));
    const items = await prisma.locationItem.findMany({ where: { gameId: String(req.params.gameId), locationId: String(req.params.locationId), validationStatus: published }, include: { item: true } });
    return data(res, items.map((entry) => ({ id: entry.id, item: entry.item, quantity: entry.quantity, acquisition_method: entry.acquisitionMethod, requires_hidden_search: entry.requiresHiddenSearch, is_one_time: entry.isOneTime, condition: entry.conditionJson })));
  } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/locations/:locationId/encounters", validate(locationParams), async (req, res, next) => {
  try {
    await ensureLocation(String(req.params.gameId), String(req.params.locationId));
    const encounters = await prisma.encounter.findMany({ where: { gameId: String(req.params.gameId), locationId: String(req.params.locationId), validationStatus: published }, include: { pokemon: true }, orderBy: [{ method: "asc" }, { minLevel: "asc" }], });
    return data(res, encounters.map((entry) => ({ id: entry.id, pokemon_id: entry.pokemonId, pokemon_name: entry.pokemon.name, method: entry.method, min_level: entry.minLevel, max_level: entry.maxLevel, encounter_rate: entry.encounterRate, conditions: entry.conditionsJson })));
  } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/locations/:locationId/trainers", validate(locationParams), async (req, res, next) => {
  try {
    await ensureLocation(String(req.params.gameId), String(req.params.locationId));
    const trainers = await prisma.trainer.findMany({ where: { gameId: String(req.params.gameId), locationId: String(req.params.locationId), validationStatus: published }, include: { pokemon: { include: { pokemon: true, heldItem: true, ability: true }, orderBy: { position: "asc" } } }, orderBy: { battleOrder: "asc" } });
    return data(res, trainers.map(trainerDto));
  } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/encounters", validate(z.object({ params: z.object({ gameId }), query: paginatedQuery.extend({ method: z.string().optional(), pokemon_id: z.string().optional() }) })), async (req, res, next) => {
  try {
    await ensureGame(String(req.params.gameId));
    const q = req.query as unknown as { page: number; page_size: number; method?: string; pokemon_id?: string };
    const where = { gameId: String(req.params.gameId), validationStatus: published, method: q.method, pokemonId: q.pokemon_id };
    const [items, total] = await prisma.$transaction([prisma.encounter.findMany({ where, include: { location: true, pokemon: true }, skip: (q.page - 1) * q.page_size, take: q.page_size, orderBy: [{ locationId: "asc" }, { minLevel: "asc" }] }), prisma.encounter.count({ where })]);
    return page(res, items.map((entry) => ({ id: entry.id, location: locationDto(entry.location), pokemon_id: entry.pokemonId, pokemon_name: entry.pokemon.name, method: entry.method, min_level: entry.minLevel, max_level: entry.maxLevel, encounter_rate: entry.encounterRate, conditions: entry.conditionsJson })), paginate(q.page, q.page_size, total));
  } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/helper/search", validate(z.object({ params: z.object({ gameId }), query: z.object({ q: z.string().trim().min(2).max(100) }) })), async (req, res, next) => {
  try {
    const id = String(req.params.gameId);
    await ensureGame(id);
    const query = String(req.query.q);
    const [locations, encounters, chapters] = await prisma.$transaction([
      prisma.location.findMany({ where: { gameId: id, completeness: published, name: { contains: query, mode: "insensitive" } }, include: { contentSources: { include: { source: true } } }, take: 10 }),
      prisma.encounter.findMany({ where: { gameId: id, validationStatus: published, pokemon: { name: { contains: query, mode: "insensitive" } } }, include: { location: true, pokemon: true, contentSources: { include: { source: true } } }, take: 10 }),
      prisma.walkthroughChapter.findMany({ where: { gameId: id, status: published, title: { contains: query, mode: "insensitive" } }, include: { contentSources: { include: { source: true } } }, take: 10 }),
    ]);
    return data(res, {
      query,
      results: [
        ...locations.map((entry) => ({ type: "LOCATION", id: entry.id, title: entry.name, summary: entry.description, references: entry.contentSources.map((source) => ({ url: source.source.url, credit: source.source.creditText, excerpt: source.excerpt })) })),
        ...encounters.map((entry) => ({ type: "ENCOUNTER", id: entry.id, title: `${entry.pokemon.name} at ${entry.location.name}`, summary: `${entry.method}, levels ${entry.minLevel}-${entry.maxLevel}`, references: entry.contentSources.map((source) => ({ url: source.source.url, credit: source.source.creditText, excerpt: source.excerpt })) })),
        ...chapters.map((entry) => ({ type: "WALKTHROUGH_CHAPTER", id: entry.id, title: entry.title, summary: entry.summary, references: entry.contentSources.map((source) => ({ url: source.source.url, credit: source.source.creditText, excerpt: source.excerpt })) })),
      ],
      source_policy: "Only PUBLISHED content with recorded source references is returned.",
    });
  } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/walkthrough", validate(gameParams), async (req, res, next) => {
  try { await ensureGame(String(req.params.gameId)); const chapters = await prisma.walkthroughChapter.findMany({ where: { gameId: String(req.params.gameId), status: published }, include: { steps: { orderBy: { stepNumber: "asc" } } }, orderBy: { chapterNumber: "asc" } }); return data(res, chapters.map(chapterDto)); } catch (error) { next(error); }
});
gameContentRouter.get("/:gameId/walkthrough/chapters", validate(gameParams), async (req, res, next) => {
  try { await ensureGame(String(req.params.gameId)); const chapters = await prisma.walkthroughChapter.findMany({ where: { gameId: String(req.params.gameId), status: published }, orderBy: { chapterNumber: "asc" } }); return data(res, chapters.map(chapterDto)); } catch (error) { next(error); }
});
gameContentRouter.get("/:gameId/walkthrough/chapters/:chapterId", validate(chapterParams), async (req, res, next) => {
  try { const chapter = await prisma.walkthroughChapter.findFirst({ where: { id: String(req.params.chapterId), gameId: String(req.params.gameId), status: published }, include: { steps: { orderBy: { stepNumber: "asc" } } } }); if (!chapter) throw notFound("Published walkthrough chapter not found."); return data(res, chapterDto(chapter)); } catch (error) { next(error); }
});
gameContentRouter.get("/:gameId/walkthrough/chapters/:chapterId/steps", validate(chapterParams), async (req, res, next) => {
  try { const chapter = await prisma.walkthroughChapter.findFirst({ where: { id: String(req.params.chapterId), gameId: String(req.params.gameId), status: published } }); if (!chapter) throw notFound("Published walkthrough chapter not found."); const steps = await prisma.walkthroughStep.findMany({ where: { chapterId: chapter.id }, orderBy: { stepNumber: "asc" } }); return data(res, steps); } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/battles", validate(gameParams), async (req, res, next) => {
  try { await ensureGame(String(req.params.gameId)); const battles = await prisma.battle.findMany({ where: { gameId: String(req.params.gameId), status: published }, orderBy: { sequenceNumber: "asc" } }); return data(res, battles); } catch (error) { next(error); }
});
gameContentRouter.get("/:gameId/battles/:battleId", validate(battleParams), async (req, res, next) => {
  try { const battle = await prisma.battle.findFirst({ where: { id: String(req.params.battleId), gameId: String(req.params.gameId), status: published }, include: { trainers: { include: { trainer: { include: { pokemon: { include: { pokemon: true, heldItem: true, ability: true }, orderBy: { position: "asc" } } } } }, orderBy: { orderIndex: "asc" } }, strategies: { where: { validationStatus: published } } } }); if (!battle) throw notFound("Published battle not found."); return data(res, battle); } catch (error) { next(error); }
});
gameContentRouter.get("/:gameId/battles/:battleId/trainers", validate(battleParams), async (req, res, next) => {
  try { const battle = await prisma.battle.findFirst({ where: { id: String(req.params.battleId), gameId: String(req.params.gameId), status: published } }); if (!battle) throw notFound("Published battle not found."); const trainers = await prisma.battleTrainer.findMany({ where: { battleId: battle.id }, include: { trainer: true }, orderBy: { orderIndex: "asc" } }); return data(res, trainers.map((entry) => ({ order_index: entry.orderIndex, trainer: entry.trainer }))); } catch (error) { next(error); }
});
gameContentRouter.get("/:gameId/battles/:battleId/strategy", validate(battleParams), async (req, res, next) => {
  try { const battle = await prisma.battle.findFirst({ where: { id: String(req.params.battleId), gameId: String(req.params.gameId), status: published } }); if (!battle) throw notFound("Published battle not found."); const strategy = await prisma.battleStrategy.findMany({ where: { battleId: battle.id, validationStatus: published } }); return data(res, strategy); } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/quests", validate(gameParams), async (req, res, next) => {
  try { await ensureGame(String(req.params.gameId)); const quests = await prisma.quest.findMany({ where: { gameId: String(req.params.gameId), status: published }, include: { steps: { orderBy: { stepNumber: "asc" } } }, orderBy: { name: "asc" } }); return data(res, quests); } catch (error) { next(error); }
});
gameContentRouter.get("/:gameId/quests/:questId", validate(questParams), async (req, res, next) => {
  try { const quest = await prisma.quest.findFirst({ where: { id: String(req.params.questId), gameId: String(req.params.gameId), status: published }, include: { steps: { orderBy: { stepNumber: "asc" } } } }); if (!quest) throw notFound("Published quest not found."); return data(res, quest); } catch (error) { next(error); }
});

gameContentRouter.get("/:gameId/checklist", validate(gameParams), async (req, res, next) => {
  try { await ensureGame(String(req.params.gameId)); const templates = await prisma.checklistTemplate.findMany({ where: { gameId: String(req.params.gameId) }, include: { items: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } }); return data(res, { completeness: templates.length ? "partial" : "not_imported", categories: templates }); } catch (error) { next(error); }
});
gameContentRouter.get("/:gameId/checklist/categories", validate(gameParams), async (req, res, next) => {
  try { await ensureGame(String(req.params.gameId)); const categories = await prisma.checklistTemplate.findMany({ where: { gameId: String(req.params.gameId) }, select: { id: true, category: true, title: true, sortOrder: true }, orderBy: { sortOrder: "asc" } }); return data(res, categories); } catch (error) { next(error); }
});

const locationDto = (location: { id: string; name: string; slug: string; region: string; description?: string | null; mapAssetUrl?: string | null; completeness?: string }) => ({ id: location.id, name: location.name, slug: location.slug, region: location.region, description: location.description, map_asset_url: location.mapAssetUrl, completeness: location.completeness });
const trainerDto = (trainer: any) => ({ id: trainer.id, name: trainer.name, trainer_class: trainer.trainerClass, battle_order: trainer.battleOrder, reward_money: trainer.rewardMoney, is_rematch: trainer.isRematch, pokemon: trainer.pokemon?.map((entry: any) => ({ position: entry.position, level: entry.level, pokemon_id: entry.pokemonId, pokemon_name: entry.pokemon.name, held_item: entry.heldItem, ability: entry.ability, moves: entry.movesJson })) ?? [] });
const chapterDto = (chapter: any) => ({ id: chapter.id, title: chapter.title, slug: chapter.slug, chapter_number: chapter.chapterNumber, summary: chapter.summary, is_postgame: chapter.isPostgame, spoiler_level: chapter.spoilerLevel, status: chapter.status, steps: chapter.steps?.map((step: any) => ({ id: step.id, step_number: step.stepNumber, title: step.title, instructions: step.instructions, is_required: step.isRequired, is_missable: step.isMissable, warning: step.warning, completion_condition: step.completionConditionJson })) ?? [] });
