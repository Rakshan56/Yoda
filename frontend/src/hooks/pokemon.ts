"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { query } from "./query";
import type { DamageResult, EvolutionResponse, Pokemon, PokemonEncounter, PokemonMove } from "@/types/api";
import type { GameId } from "@/types/api";

export function usePokemonList(search?: string, gameId?: string, type?: string) {
  const params = new URLSearchParams({ page: "1", page_size: "48" });
  if (search) params.set("search", search);
  if (gameId) params.set("game_id", gameId);
  if (type) params.set("type", type);
  return query<{ data: Pokemon[]; meta: { page: number; page_size: number; total: number; total_pages: number } }>(["pokemon", search, gameId, type], `/pokemon?${params.toString()}`);
}

export function usePokemon(pokemonId: string) {
  return query<Pokemon>(["pokemon-detail", pokemonId], `/pokemon/${pokemonId}`, Boolean(pokemonId));
}

export function usePokemonRelations(pokemonId: string) {
  const enabled = Boolean(pokemonId);
  return {
    evolutions: query<EvolutionResponse>(["pokemon-evolutions", pokemonId], `/pokemon/${pokemonId}/evolutions`, enabled),
    moves: query<PokemonMove[]>(["pokemon-moves", pokemonId], `/pokemon/${pokemonId}/moves`, enabled),
    encounters: query<PokemonEncounter[]>(["pokemon-encounters", pokemonId], `/pokemon/${pokemonId}/encounters`, enabled)
  };
}

export function usePokemonCompare(ids: string[]) {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  return query<Pokemon[]>(["pokemon-compare", uniqueIds], `/pokemon/compare?ids=${uniqueIds.join(",")}`, uniqueIds.length >= 2);
}

export function useBattleCalculate() {
  return useMutation({
    mutationFn: (input: { game_id: GameId; level: number; attack: number; defense: number; power: number; move_type: string; defender_types: string[]; stab?: boolean; critical?: boolean; burned?: boolean; weather?: "sun" | "rain" | "none"; screen?: "reflect" | "light_screen" | "none" }) =>
      apiFetch<DamageResult>("/tools/battle/calculate", { method: "POST", body: JSON.stringify(input) })
  });
}

export function useTeamAnalysis() {
  return useMutation({
    mutationFn: (input: { game_id: GameId; pokemon_ids: string[] }) =>
      apiFetch<{ members: Array<{ id: string; name: string; types: string[] }>; weaknesses: Record<string, number>; resistances: Record<string, number> }>("/tools/battle/team-analysis", { method: "POST", body: JSON.stringify(input) })
  });
}
