"use client";

import { CheckCircle2, ScrollText } from "lucide-react";
import { useParams } from "next/navigation";
import { useGame, useQuests } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function QuestsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = useGame(gameId);
  const quests = useQuests(gameId);
  if (game.isLoading || quests.isLoading) return <LoadingState label="Loading quests..." />;
  if (game.isError || quests.isError) return <ErrorState message={(game.error ?? quests.error)?.message} />;
  return <div className="space-y-8"><div><p className="eyebrow">{game.data?.name} · Progression</p><h1 className="page-title">Quests</h1><p className="mt-3 text-sm text-muted">Published optional objectives and side content for this game.</p></div>{!quests.data?.length ? <EmptyState title="No published quests" description="Quest content will appear after source review." /> : <div className="grid gap-4 md:grid-cols-2">{quests.data.map((quest) => <Card className="p-5" key={quest.id}><ScrollText className="text-gold" size={20} /><h2 className="mt-6 font-bold text-white">{quest.name}</h2><p className="mt-2 text-sm leading-5 text-muted">{quest.description ?? "Description unavailable."}</p><div className="mt-5 space-y-2">{quest.steps.map((step) => <div className="flex items-start gap-2 text-xs text-muted" key={step.id}><CheckCircle2 size={14} className="mt-0.5 text-muted" /><span>{step.title}</span></div>)}</div></Card>)}</div>}</div>;
}
