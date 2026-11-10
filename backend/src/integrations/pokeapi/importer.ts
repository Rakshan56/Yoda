import { createHash } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import { pokeApi } from "./client.js";
import { english, englishEffect, englishShortEffect } from "./mapper.js";

type Named = { name: string; url: string };
type PokemonPayload = {
  id: number; name: string; height: number; weight: number; base_experience: number;
  sprites: { front_default: string | null; back_default: string | null; front_shiny: string | null; back_shiny: string | null };
  stats: Array<{ base_stat: number; stat: Named }>;
  types: Array<{ slot: number; type: Named }>;
  abilities: Array<{ slot: number; is_hidden: boolean; ability: Named }>;
  moves: Array<{ move: Named; version_group_details: Array<{ level_learned_at: number; move_learn_method: Named; version_group: Named }> }>;
};
type SpeciesPayload = {
  name: string; id: number; capture_rate: number; base_happiness: number | null; growth_rate: Named | null;
  is_legendary: boolean; is_mythical: boolean; flavor_text_entries: Array<{ language: { name: string }; flavor_text: string }>;
  evolution_chain: { url: string };
};
type DetailPayload = { id: number; name: string; names: Array<{ language: { name: string }; name: string }>; effect_entries: Array<{ language: { name: string }; effect: string }>; short_effect?: string; type?: Named; power: number | null; accuracy: number | null; pp: number | null; priority: number; target: Named };
type ItemPayload = { id: number; name: string; names: Array<{ language: { name: string }; name: string }>; category: Named; effect_entries: Array<{ language: { name: string }; effect: string }> };

const versionGroups: Record<string, string[]> = {
  firered: ["firered-leafgreen"], leafgreen: ["firered-leafgreen"],
  ruby: ["ruby-sapphire"], sapphire: ["ruby-sapphire"], emerald: ["emerald"]
};

export type ImportOptions = { limit: number; dryRun: boolean; coreOnly?: boolean; start?: number };
export async function importReferenceData({ limit, dryRun, coreOnly = false, start = 1 }: ImportOptions) {
  const source = dryRun ? null : await prisma.sourceRegistry.upsert({
    where: { id: "pokeapi" }, update: { retrievedAt: new Date() },
    create: { id: "pokeapi", name: "PokéAPI", sourceType: "API", url: "https://pokeapi.co/", organization: "PokéAPI contributors", creditText: "Reference data imported from PokéAPI.", licenseNotes: "Review PokéAPI and underlying source licenses before publishing." }
  });
  let imported = 0;
  const evolutionUrls = new Set<string>();
  for (let id = start; id <= limit; id += 1) {
    console.log(`Reference import progress: ${id - start}/${limit - start + 1} (loading Pokémon ${id})`);
    const pokemon = await pokeApi.get<PokemonPayload>(`pokemon/${id}`);
    const species = await pokeApi.get<SpeciesPayload>(`pokemon-species/${id}`);
    evolutionUrls.add(species.evolution_chain.url);
    if (dryRun) { imported += 1; continue; }
    const record = await prisma.pokemonSpecies.upsert({ where: { nationalDexNumber: species.id }, update: { name: english([{ language: { name: "en" }, name: species.name }]), captureRate: species.capture_rate, baseHappiness: species.base_happiness, growthRate: species.growth_rate?.name, isLegendary: species.is_legendary, isMythical: species.is_mythical }, create: { name: species.name, nationalDexNumber: species.id, generation: 3, captureRate: species.capture_rate, baseHappiness: species.base_happiness, growthRate: species.growth_rate?.name, isLegendary: species.is_legendary, isMythical: species.is_mythical, description: species.flavor_text_entries.find((entry) => entry.language.name === "en")?.flavor_text.replace(/\s+/g, " ").trim() ?? null } });
    const savedPokemon = await prisma.pokemon.upsert({ where: { speciesId: record.id }, update: { name: pokemon.name, height: pokemon.height, weight: pokemon.weight, baseExperience: pokemon.base_experience, spriteFront: pokemon.sprites.front_default, spriteBack: pokemon.sprites.back_default, spriteShinyFront: pokemon.sprites.front_shiny, spriteShinyBack: pokemon.sprites.back_shiny }, create: { speciesId: record.id, name: pokemon.name, height: pokemon.height, weight: pokemon.weight, baseExperience: pokemon.base_experience, spriteFront: pokemon.sprites.front_default, spriteBack: pokemon.sprites.back_default, spriteShinyFront: pokemon.sprites.front_shiny, spriteShinyBack: pokemon.sprites.back_shiny } });
    const stats = Object.fromEntries(pokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]));
    await prisma.pokemonStat.upsert({ where: { pokemonId: savedPokemon.id }, update: { hp: stats.hp ?? 0, attack: stats.attack ?? 0, defense: stats.defense ?? 0, specialAttack: stats["special-attack"] ?? 0, specialDefense: stats["special-defense"] ?? 0, speed: stats.speed ?? 0 }, create: { pokemonId: savedPokemon.id, hp: stats.hp ?? 0, attack: stats.attack ?? 0, defense: stats.defense ?? 0, specialAttack: stats["special-attack"] ?? 0, specialDefense: stats["special-defense"] ?? 0, speed: stats.speed ?? 0 } });
    for (const entry of pokemon.types) {
      const type = await prisma.type.upsert({ where: { id: entry.type.name }, update: { name: entry.type.name }, create: { id: entry.type.name, name: entry.type.name } });
      await prisma.pokemonType.upsert({ where: { pokemonId_typeId: { pokemonId: savedPokemon.id, typeId: type.id } }, update: { slot: entry.slot }, create: { pokemonId: savedPokemon.id, typeId: type.id, slot: entry.slot } });
    }
    if (coreOnly) {
      if (source) await prisma.sourceRecord.upsert({ where: { sourceId_externalRecordId_contentType: { sourceId: source.id, externalRecordId: String(id), contentType: "pokemon" } }, update: { checksum: createHash("sha256").update(JSON.stringify(pokemon)).digest("hex") }, create: { sourceId: source.id, externalRecordId: String(id), contentType: "pokemon", checksum: createHash("sha256").update(JSON.stringify(pokemon)).digest("hex") } });
      imported += 1;
      if (imported % 10 === 0 || id === limit) console.log(`Reference import progress: ${imported}/${limit - start + 1}`);
      continue;
    }
    console.log(`Reference import progress: ${id - 1}/${limit} (enriching Pokémon ${id})`);
    const typeNames = await Promise.all(pokemon.types.map((entry) => pokeApi.get<DetailPayload>(`type/${entry.type.name}`)));
    for (const type of typeNames) await prisma.type.upsert({ where: { id: type.name }, update: { name: english(type.names) }, create: { id: type.name, name: english(type.names) } });
    const abilityPayloads = await Promise.all(pokemon.abilities.map((entry) => pokeApi.get<DetailPayload>(`ability/${entry.ability.name}`)));
    for (const ability of abilityPayloads) await prisma.ability.upsert({ where: { id: ability.name }, update: { name: english(ability.names), effect: englishEffect(ability.effect_entries), shortEffect: ability.short_effect ?? null }, create: { id: ability.name, name: english(ability.names), effect: englishEffect(ability.effect_entries), shortEffect: ability.short_effect ?? null } });
    for (const entry of pokemon.abilities) { const ability = await prisma.ability.findUniqueOrThrow({ where: { id: entry.ability.name } }); await prisma.pokemonAbility.upsert({ where: { pokemonId_abilityId: { pokemonId: savedPokemon.id, abilityId: ability.id } }, update: { slot: entry.slot, isHidden: entry.is_hidden }, create: { pokemonId: savedPokemon.id, abilityId: ability.id, slot: entry.slot, isHidden: entry.is_hidden } }); }
    for (const moveEntry of pokemon.moves) for (const detail of moveEntry.version_group_details) if (detail.version_group.name === "firered-leafgreen" || detail.version_group.name === "ruby-sapphire" || detail.version_group.name === "emerald") {
      const move = await pokeApi.get<DetailPayload>(`move/${moveEntry.move.name}`);
      const type = move.type
        ? await prisma.type.upsert({
          where: { id: move.type.name },
          update: { name: english(move.names) },
          create: { id: move.type.name, name: english(move.names) },
        })
        : null;
      if (!type) continue;
      await prisma.move.upsert({ where: { id: move.name }, update: { name: english(move.names), typeId: type.id, power: move.power, accuracy: move.accuracy, pp: move.pp, priority: move.priority, target: move.target.name, generation: 3, effect: englishEffect(move.effect_entries) }, create: { id: move.name, name: english(move.names), typeId: type.id, power: move.power, accuracy: move.accuracy, pp: move.pp, priority: move.priority, target: move.target.name, generation: 3, effect: englishEffect(move.effect_entries) } });
      for (const gameId of Object.keys(versionGroups).filter((game) => versionGroups[game]?.includes(detail.version_group.name))) await prisma.pokemonMove.upsert({ where: { pokemonId_moveId_gameId_learnMethod: { pokemonId: savedPokemon.id, moveId: move.name, gameId, learnMethod: detail.move_learn_method.name } }, update: { levelLearned: detail.level_learned_at, versionGroup: detail.version_group.name }, create: { pokemonId: savedPokemon.id, moveId: move.name, gameId, learnMethod: detail.move_learn_method.name, levelLearned: detail.level_learned_at, versionGroup: detail.version_group.name } });
    }
    if (source) await prisma.sourceRecord.upsert({ where: { sourceId_externalRecordId_contentType: { sourceId: source.id, externalRecordId: String(id), contentType: "pokemon" } }, update: { checksum: createHash("sha256").update(JSON.stringify(pokemon)).digest("hex") }, create: { sourceId: source.id, externalRecordId: String(id), contentType: "pokemon", checksum: createHash("sha256").update(JSON.stringify(pokemon)).digest("hex") } });
    imported += 1;
    if (imported % 10 === 0 || id === limit) console.log(`Reference import progress: ${imported}/${limit - start + 1}`);
  }
  if (!dryRun && !coreOnly) {
    console.log(`Reference import progress: ${imported}/${limit} (importing items)`);
    const itemList = await pokeApi.get<{ results: Named[] }>(`item?limit=${limit}`);
    for (const itemRef of itemList.results) {
      const item = await pokeApi.get<ItemPayload>(`item/${itemRef.name}`);
      await prisma.item.upsert({
        where: { id: item.name },
        update: { name: english(item.names), category: item.category.name, effect: englishEffect(item.effect_entries) },
        create: { id: item.name, name: english(item.names), category: item.category.name, effect: englishEffect(item.effect_entries) }
      });
    }
    console.log(`Reference import progress: ${imported}/${limit} (importing evolutions)`);
    for (const evolutionUrl of evolutionUrls) {
      const chain = await pokeApi.get<{ chain: EvolutionNode }>(evolutionUrl);
      await saveEvolutionChain(chain.chain);
    }
  }
  return { imported, dry_run: dryRun, status: dryRun ? "preview" : "needs_review" };
}

type EvolutionNode = {
  species: Named;
  evolves_to: EvolutionNode[];
  evolution_details: Array<{ trigger: Named; min_level: number | null; item: Named | null; min_happiness: number | null; time_of_day: string }>;
};
async function saveEvolutionChain(node: EvolutionNode, fromSpeciesId?: string) {
  const currentId = String(node.species.url.match(/pokemon-species\/(\d+)/)?.[1] ?? "");
  const current = await prisma.pokemonSpecies.findUnique({ where: { nationalDexNumber: Number(currentId) } });
  if (!current) return;
  if (fromSpeciesId) {
    for (const detail of node.evolution_details) {
      const itemId = detail.item?.name ?? null;
      if (itemId) await prisma.item.upsert({ where: { id: itemId }, update: {}, create: { id: itemId, name: itemId } });
      await prisma.evolution.upsert({
        where: { fromSpeciesId_toSpeciesId_trigger: { fromSpeciesId, toSpeciesId: current.id, trigger: detail.trigger.name } },
        update: { minLevel: detail.min_level, itemId, conditionJson: { min_happiness: detail.min_happiness, time_of_day: detail.time_of_day } },
        create: { fromSpeciesId, toSpeciesId: current.id, trigger: detail.trigger.name, minLevel: detail.min_level, itemId, conditionJson: { min_happiness: detail.min_happiness, time_of_day: detail.time_of_day } }
      });
    }
  }
  for (const child of node.evolves_to) await saveEvolutionChain(child, current.id);
}
