"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { query } from "./query";
import type { GameId, Team, TeamMember } from "@/types/api";

export function useTeams() {
  return query<Team[]>(["teams"], "/user/teams");
}

export function useCreateTeam() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { game_id: GameId; name: string; description?: string; is_favorite?: boolean }) => apiFetch<Team>("/user/teams", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["teams"] })
  });
}

export function useDeleteTeam() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => apiFetch(`/user/teams/${teamId}`, { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["teams"] })
  });
}

export function useAddTeamMember(teamId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { pokemon_id: string; slot: number; level?: number; nature?: string; is_shiny?: boolean }) => apiFetch<TeamMember>(`/user/teams/${teamId}/members`, { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["teams"] })
  });
}
