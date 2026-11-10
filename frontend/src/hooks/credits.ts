"use client";

import { query } from "./query";
import type { Credits } from "@/types/api";

export function useCredits(gameId?: string) {
  return query<Credits>(["credits", gameId], gameId ? `/credits/${gameId}/credits` : "/credits");
}
