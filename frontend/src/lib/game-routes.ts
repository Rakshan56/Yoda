import { GAME_IDS, type GameId } from "@/types/api";

const GAME_SLUGS: Record<GameId, string> = {
  firered: "pokemon-firered",
  leafgreen: "pokemon-leafgreen",
  ruby: "pokemon-ruby",
  sapphire: "pokemon-sapphire",
  emerald: "pokemon-emerald"
};

const GAME_IDS_BY_SLUG = Object.fromEntries(
  GAME_IDS.map((id) => [GAME_SLUGS[id], id])
) as Record<string, GameId>;

export function gamePath(gameId: GameId) {
  return `/games/${GAME_SLUGS[gameId]}`;
}

export function resolveGameId(value: string): GameId | string {
  return GAME_IDS_BY_SLUG[value] ?? value;
}
