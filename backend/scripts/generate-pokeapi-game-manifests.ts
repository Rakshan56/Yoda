import { mkdir, writeFile } from "node:fs/promises";

type Named = { name: string; url: string };
type Region = { locations: Named[] };
type Location = { name: string; names: { name: string; language: Named }[]; areas: Named[] };
type LocationArea = {
  location: Named;
  pokemon_encounters: {
    pokemon: Named;
    version_details: {
      version: Named;
      max_chance: number;
      encounter_details: {
        min_level: number;
        max_level: number;
        chance: number;
        method: Named;
        condition_values: Named[];
      }[];
    }[];
  }[];
};

const api = "https://pokeapi.co/api/v2";
const games = [
  { id: "firered", region: "kanto" },
  { id: "leafgreen", region: "kanto" },
  { id: "ruby", region: "hoenn" },
  { id: "sapphire", region: "hoenn" },
  { id: "emerald", region: "hoenn" },
] as const;

async function get<T>(path: string): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const url = path.startsWith("http") ? path : `${api}/${path}`;
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; YodaBackendManifestGenerator/1.0)" },
    });
    if (response.ok) return response.json() as Promise<T>;
    if (response.status !== 403 && response.status !== 429) {
      throw new Error(`PokeAPI request failed (${response.status}): ${url}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
  }
  throw new Error(`PokeAPI rate limit prevented retrieving: ${path}`);
}

async function mapConcurrent<T, U>(values: T[], worker: (value: T) => Promise<U>, concurrency = 8): Promise<U[]> {
  const results: U[] = [];
  let next = 0;
  async function run() {
    while (next < values.length) {
      const index = next++;
      results[index] = await worker(values[index]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, run));
  return results;
}

function slugName(value: string) {
  return value.replace(/-area$/, "").replace(/-/g, " ");
}

function idFromUrl(url: string) {
  return url.split("/").filter(Boolean).at(-1) ?? url;
}

const regions = new Map<string, Region>();
for (const region of ["kanto", "hoenn"]) regions.set(region, await get<Region>(`region/${region}`));

await mkdir("data", { recursive: true });

for (const game of games) {
  const region = regions.get(game.region)!;
  const locations = await mapConcurrent(region.locations, (entry) => get<Location>(entry.url), 2);
  const areas = locations.flatMap((location) => location.areas);
  const areaData = await mapConcurrent(areas, (entry) => get<LocationArea>(entry.url), 2);
  const locationRecords = locations.map((location) => ({
    external_id: location.name,
    name: location.names.find((name) => name.language.name === "en")?.name ?? slugName(location.name),
    slug: location.name,
    region: game.region.charAt(0).toUpperCase() + game.region.slice(1),
    description: `Location data sourced from PokeAPI for Pokémon ${game.id}.`,
    map_asset_url: null,
  }));
  const encounterRecords = areaData.flatMap((area) =>
    area.pokemon_encounters.flatMap((pokemonEncounter) =>
      pokemonEncounter.version_details
        .filter((version) => version.version.name === game.id)
        .flatMap((version) =>
          version.encounter_details.map((detail, index) => ({
            external_id: `${idFromUrl(area.location.url)}-${idFromUrl(pokemonEncounter.pokemon.url)}-${detail.method.name}-${detail.min_level}-${detail.max_level}-${index}`,
            location_external_id: area.location.name,
            pokemon_id: idFromUrl(pokemonEncounter.pokemon.url),
            method: detail.method.name.toUpperCase(),
            min_level: detail.min_level,
            max_level: detail.max_level,
            encounter_rate: detail.chance,
            conditions: detail.condition_values.length ? { values: detail.condition_values.map((condition) => condition.name) } : null,
          })),
        ),
    ),
  );
  const manifest = {
    game_id: game.id,
    source: {
      id: `pokeapi-${game.id}-2026`,
      name: "PokeAPI",
      url: `${api}/version/${game.id}`,
      organization: "PokeAPI contributors",
      license_notes: "Review PokeAPI licensing and source attribution requirements before publication.",
      credit_text: `Structured ${game.id} location and encounter data generated from PokeAPI.`,
    },
    locations: locationRecords,
    connections: [],
    encounters: encounterRecords,
  };
  await writeFile(`data/${game.id}.json`, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ game_id: game.id, locations: locationRecords.length, encounters: encounterRecords.length }));
}
