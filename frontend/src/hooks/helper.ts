"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { query } from "./query";
import type { GameId, HelperConversation, HelperMessage } from "@/types/api";

export function useHelperConversations() {
  return query<HelperConversation[]>(["helper-conversations"], "/helper/conversations");
}

export function useCreateHelperConversation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { game_id?: GameId; title?: string }) => apiFetch<HelperConversation>("/helper/conversations", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["helper-conversations"] })
  });
}

export function useSendHelperMessage(conversationId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => apiFetch<HelperMessage>(`/helper/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ content }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["helper-conversations"] })
  });
}
