"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { query } from "./query";
import type { Battle, Game, GameId, GameProgress, Location, LocationConnection, Encounter, Trainer, WalkthroughChapter, LocationItem, Quest, ChecklistCategory } from "@/types/api";
import { resolveGameId } from "@/lib/game-routes";

export function useGames(search?: string) {
  const suffix = search ? `&search=${encodeURIComponent(search)}` : "";
  return query<{ data: Game[]; meta: unknown }>(["games", search], `/games?page=1&page_size=24${suffix}`);
}

export function useGame(gameId: string) {
  const id = resolveGameId(gameId);
  return query<Game>(["game", id], `/games/${id}`, Boolean(gameId));
}

export function useGameOverview(gameId: string) {
  const id = resolveGameId(gameId);
  return query<Game & { counts: Record<string, number>; completeness: string }>(["game-overview", id], `/games/${id}/overview`, Boolean(gameId));
}

export function useProgress() {
  return query<GameProgress[]>(["progress"], "/user/progress");
}

export function useUpdateProgress(gameId: GameId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (status: GameProgress["status"]) => apiFetch(`/user/progress/${gameId}`, { method: "PUT", body: JSON.stringify({ status }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["progress"] })
  });
}

export function useWalkthrough(gameId: string) {
  const id = resolveGameId(gameId);
  return query<WalkthroughChapter[]>(["walkthrough", id], `/games/${id}/walkthrough`, Boolean(gameId));
}

export function useLocations(gameId: string, search?: string) {
  const id = resolveGameId(gameId);
  const suffix = search ? `&search=${encodeURIComponent(search)}` : "";
  return query<{ data: Location[]; meta: unknown }>(["locations", id, search], `/games/${id}/locations?page=1&page_size=100${suffix}`, Boolean(gameId));
}

export function useLocation(gameId: string, locationId: string) {
  const id = resolveGameId(gameId);
  return query<Location>(["location", id, locationId], `/games/${id}/locations/${locationId}`, Boolean(gameId && locationId));
}

export function useLocationContent(gameId: string, locationId: string) {
  const enabled = Boolean(gameId && locationId);
  const id = resolveGameId(gameId);
  return {
    connections: query<LocationConnection[]>(["location-connections", id, locationId], `/games/${id}/locations/${locationId}/connections`, enabled),
    encounters: query<Encounter[]>(["location-encounters", id, locationId], `/games/${id}/locations/${locationId}/encounters`, enabled),
    trainers: query<Trainer[]>(["location-trainers", id, locationId], `/games/${id}/locations/${locationId}/trainers`, enabled),
    items: query<LocationItem[]>(["location-items", id, locationId], `/games/${id}/locations/${locationId}/items`, enabled)
  };
}

export function useBattle(gameId: string, battleId: string) {
  const id = resolveGameId(gameId);
  return query<Battle>(["battle", id, battleId], `/games/${id}/battles/${battleId}`, Boolean(gameId && battleId));
}

export function useBattles(gameId: string) {
  const id = resolveGameId(gameId);
  return query<Battle[]>(["battles", id], `/games/${id}/battles`, Boolean(gameId));
}

export function useQuests(gameId: string) {
  const id = resolveGameId(gameId);
  return query<Quest[]>(["quests", id], `/games/${id}/quests`, Boolean(gameId));
}

export function useChecklist(gameId: string) {
  const id = resolveGameId(gameId);
  return query<{ completeness: string; categories: ChecklistCategory[] }>(["checklist", id], `/games/${id}/checklist`, Boolean(gameId));
}
