import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { data, page } from "../../lib/response.js";
import { paginate } from "../../lib/pagination.js";
import { notFound } from "../../lib/errors.js";
import { AppError } from "../../lib/errors.js";
import { validate } from "../middleware/validate.js";
import { gameId, paginatedQuery } from "../schemas/common.js";
export const pokemonRouter = Router();
pokemonRouter.get("/", validate(z.object({ query: paginatedQuery.extend({ game_id: gameId.optional(), type: z.string().optional() }) })), async (req, res, next) => {
  try {
    const q = req.query as unknown as { page: number; page_size: number; search?: string; game_id?: string; type?: string };
    const where = { name: q.search ? { contains: q.search, mode: "insensitive" as const } : undefined, gamePokemon: q.game_id ? { some: { gameId: q.game_id } } : undefined, types: q.type ? { some: { type: { name: q.type } } } : undefined };
    const [items, total] = await prisma.$transaction([prisma.pokemon.findMany({ where, include: { species: true, stats: true, types: { include: { type: true } }, abilities: { where: { isHidden: false }, include: { ability: true } } }, skip: (q.page - 1) * q.page_size, take: q.page_size, orderBy: { species: { nationalDexNumber: "asc" } } }), prisma.pokemon.count({ where })]);
    return page(res, items.map(pokemonDto), paginate(q.page, q.page_size, total));
  } catch (error) { next(error); }
});
pokemonRouter.get("/compare", validate(z.object({ query: z.object({ ids: z.string().min(1) }) })), async (req, res, next) => {
  try {
    const ids = String(req.query.ids).split(",").map((id) => id.trim()).filter(Boolean);
    if (ids.length < 2 || ids.length > 6) throw new AppError(422, "VALIDATION_ERROR", "Comparison requires between 2 and 6 Pokémon IDs.");
    const items = await prisma.pokemon.findMany({ where: { id: { in: ids } }, include: { species: true, stats: true, types: { include: { type: true } }, abilities: { where: { isHidden: false }, include: { ability: true } } } });
    if (items.length !== ids.length) throw notFound("One or more Pokémon records were not found.");
    return data(res, items.map(pokemonDto));
  } catch (error) { next(error); }
});
pokemonRouter.get("/:pokemonId", async (req, res, next) => {
  try { const pokemon = await prisma.pokemon.findUnique({ where: { id: req.params.pokemonId }, include: { species: true, stats: true, types: { include: { type: true } }, abilities: { where: { isHidden: false }, include: { ability: true } } } }); if (!pokemon) throw notFound(); return data(res, pokemonDto(pokemon)); } catch (error) { next(error); }
});
pokemonRouter.get("/:pokemonId/evolutions", async (req, res, next) => { try { const pokemon = await prisma.pokemon.findUnique({ where: { id: String(req.params.pokemonId) }, select: { speciesId: true } }); if (!pokemon) throw notFound(); const evolutions = await prisma.evolution.findMany({ where: { OR: [{ fromSpeciesId: pokemon.speciesId }, { toSpeciesId: pokemon.speciesId }] }, include: { fromSpecies: true, toSpecies: true, item: true } }); return data(res, { data_available: evolutions.length > 0, evolutions }); } catch (error) { next(error); } });
pokemonRouter.get("/:pokemonId/moves", async (req, res, next) => { try { const moves = await prisma.pokemonMove.findMany({ where: { pokemonId: req.params.pokemonId }, include: { move: true, game: true }, orderBy: [{ gameId: "asc" }, { levelLearned: "asc" }] }); return data(res, moves.map((item: any) => ({ id: item.id, game_id: item.gameId, move: item.move, learn_method: item.learnMethod, level_learned: item.levelLearned }))); } catch (error) { next(error); } });
pokemonRouter.get("/:pokemonId/encounters", async (req, res, next) => { try { const encounters = await prisma.encounter.findMany({ where: { pokemonId: String(req.params.pokemonId) }, include: { game: true, location: true } }); return data(res, encounters.map((entry: typeof encounters[number]) => ({ id: entry.id, game_id: entry.gameId, game_name: entry.game.name, location: { id: entry.location.id, name: entry.location.name, slug: entry.location.slug }, method: entry.method, min_level: entry.minLevel, max_level: entry.maxLevel, encounter_rate: entry.encounterRate, conditions: entry.conditionsJson, validation_status: entry.validationStatus }))); } catch (error) { next(error); } });
const pokemonDto = (item: any) => ({
  id: item.id,
  name: item.name,
  species: {
    id: item.species.id,
    name: item.species.name,
    national_dex_number: item.species.nationalDexNumber,
    generation: item.species.generation,
    capture_rate: item.species.captureRate,
    base_happiness: item.species.baseHappiness,
    growth_rate: item.species.growthRate,
    is_legendary: item.species.isLegendary,
    is_mythical: item.species.isMythical,
    description: item.species.description,
  },
  height: item.height,
  weight: item.weight,
  base_experience: item.baseExperience,
  sprites: { front: item.spriteFront, back: item.spriteBack, shiny_front: item.spriteShinyFront, shiny_back: item.spriteShinyBack },
  stats: item.stats ? { hp: item.stats.hp, attack: item.stats.attack, defense: item.stats.defense, special_attack: item.stats.specialAttack, special_defense: item.stats.specialDefense, speed: item.stats.speed } : null,
  types: item.types.map((entry: any) => ({ slot: entry.slot, name: entry.type.name })),
  abilities: item.abilities.map((entry: any) => ({ slot: entry.slot, name: entry.ability.name, effect: entry.ability.shortEffect })),
});
