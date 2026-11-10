"use client";

import { Check, Circle } from "lucide-react";
import { useProgress, useUpdateProgress } from "@/hooks/use-game-content";
import type { GameId } from "@/types/api";

export function GameProgress({ gameId }: { gameId: GameId }) {
  const progress = useProgress();
  const update = useUpdateProgress(gameId);
  const current = progress.data?.find((item) => item.game_id === gameId)?.status ?? "NOT_STARTED";
  return <div className="flex items-center gap-3"><span className="text-xs text-muted">Progress</span><button disabled={update.isPending} onClick={() => update.mutate(current === "COMPLETE" ? "NOT_STARTED" : "COMPLETE")} className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-white transition hover:border-gold disabled:opacity-50">{current === "COMPLETE" ? <Check size={14} className="text-emerald" /> : <Circle size={14} className="text-muted" />}{current === "COMPLETE" ? "Completed" : "Mark complete"}</button></div>;
}
