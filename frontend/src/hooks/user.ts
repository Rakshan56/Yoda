"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { query } from "./query";
import type { CollectionEntry, GameId, Item, Team, TeamMember, User } from "@/types/api";

export function useItems(search?: string, category?: string) {
  const params = new URLSearchParams({ page: "1", page_size: "60" });
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  return query<{ data: Item[]; meta: unknown }>(["items", search, category], `/items?${params.toString()}`);
}

export function useCollection(gameId?: string) {
  return query<CollectionEntry[]>(["collection", gameId], gameId ? `/user/${gameId}/collection` : "/user/progress", Boolean(gameId));
}

export function useUpdateCollection(gameId: GameId) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { pokemonId: string; status: CollectionEntry["status"]; is_shiny?: boolean }) => apiFetch(`/user/${gameId}/collection/${input.pokemonId}`, { method: "PUT", body: JSON.stringify({ status: input.status, is_shiny: input.is_shiny }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["collection", gameId] })
  });
}

export function useCurrentUser() {
  return query<User>(["current-user"], "/auth/me");
}
