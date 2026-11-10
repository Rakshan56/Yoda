import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
const games = ["firered", "leafgreen", "ruby", "sapphire", "emerald"];
const expectedReferenceCount = 386;
const issues: string[] = [];
const result = await prisma.game.findMany({
  where: { id: { in: games } },
  select: { id: true },
});
const missing = games.filter(
  (id) => !result.some((game: (typeof result)[number]) => game.id === id),
);
if (missing.length)
  issues.push(`missing canonical games: ${missing.join(", ")}`);
const [
  speciesCount,
  pokemonCount,
  locations,
  encounters,
  openQualityIssues,
  locationSources,
  encounterSources,
] = await Promise.all([
  prisma.pokemonSpecies.count({
    where: { nationalDexNumber: { lte: expectedReferenceCount } },
  }),
  prisma.pokemon.count(),
  prisma.location.findMany({ select: { id: true, gameId: true } }),
  prisma.encounter.findMany({
    select: {
      id: true,
      gameId: true,
      locationId: true,
      pokemonId: true,
      minLevel: true,
      maxLevel: true,
    },
  }),
  prisma.dataQualityIssue.count({ where: { status: { not: "RESOLVED" } } }),
  prisma.contentSource.count({ where: { targetType: "LOCATION" } }),
  prisma.contentSource.count({ where: { targetType: "ENCOUNTER" } }),
]);
if (speciesCount < expectedReferenceCount)
  issues.push(
    `reference species coverage is ${speciesCount}/${expectedReferenceCount}`,
  );
if (pokemonCount < expectedReferenceCount)
  issues.push(
    `reference Pokémon coverage is ${pokemonCount}/${expectedReferenceCount}`,
  );
if (!locations.length) issues.push("no game locations have been imported");
if (!encounters.length) issues.push("no game encounters have been imported");
if (openQualityIssues)
  issues.push(`${openQualityIssues} unresolved data-quality issue(s) remain`);
if (locationSources < locations.length)
  issues.push(
    `locations missing source evidence: ${locations.length - locationSources}`,
  );
if (encounterSources < encounters.length)
  issues.push(
    `encounters missing source evidence: ${encounters.length - encounterSources}`,
  );
const locationIds = new Set(locations.map((location) => location.id));
const invalidEncounters = encounters.filter(
  (encounter) => !locationIds.has(encounter.locationId),
);
if (invalidEncounters.length)
  issues.push(`encounters with invalid locations: ${invalidEncounters.length}`);
const pokemonIds = new Set(
  (await prisma.pokemon.findMany({ select: { id: true } })).map(
    (pokemon) => pokemon.id,
  ),
);
const encountersWithMissingPokemon = encounters.filter(
  (encounter) => !pokemonIds.has(encounter.pokemonId),
);
if (encountersWithMissingPokemon.length)
  issues.push(
    `encounters with missing Pokémon: ${encountersWithMissingPokemon.length}`,
  );
const chapters = await prisma.walkthroughChapter.findMany({
  include: {
    steps: { orderBy: { stepNumber: "asc" }, select: { stepNumber: true } },
  },
});
const invalidChapterOrder = chapters.some((chapter) =>
  chapter.steps.some((step, index) => step.stepNumber !== index + 1),
);
if (invalidChapterOrder)
  issues.push("walkthrough steps are not contiguous from 1");
const invalidLevels = encounters.filter(
  (encounter) =>
    encounter.minLevel < 1 ||
    encounter.maxLevel > 100 ||
    encounter.minLevel > encounter.maxLevel,
);
if (invalidLevels.length)
  issues.push(`encounters with invalid levels: ${invalidLevels.length}`);
for (const gameId of games) {
  const gameLocations = locations.filter(
    (location) => location.gameId === gameId,
  ).length;
  const gameEncounters = encounters.filter(
    (encounter) => encounter.gameId === gameId,
  ).length;
  if (!gameLocations) issues.push(`${gameId}: no locations imported`);
  if (!gameEncounters) issues.push(`${gameId}: no encounters imported`);
}
if (issues.length) {
  console.error(`Data validation failed:\n- ${issues.join("\n- ")}`);
  process.exitCode = 1;
} else
  console.log(
    `Data validation passed: ${games.length} games, ${speciesCount} species, ${locations.length} locations, ${encounters.length} encounters.`,
  );
await prisma.$disconnect();
