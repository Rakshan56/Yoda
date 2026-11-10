"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useGame, useWalkthrough } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function ChapterPage() {
  const { gameId, chapterId } = useParams<{ gameId: string; chapterId: string }>();
  const game = useGame(gameId);
  const walkthrough = useWalkthrough(gameId);
  if (game.isLoading || walkthrough.isLoading) return <LoadingState />;
  if (game.isError || walkthrough.isError) return <ErrorState message={(game.error ?? walkthrough.error)?.message} />;
  const chapter = walkthrough.data?.find((item) => item.id === chapterId);
  if (!chapter) return <EmptyState title="Chapter unavailable" description="This chapter is not published for the selected game." />;
  return <div className="mx-auto max-w-3xl space-y-8"><div><Link href={`/games/${gameId}/walkthrough`} className="text-xs font-semibold text-gold">← Back to walkthrough</Link><p className="eyebrow mt-6">{game.data?.name} · Chapter {chapter.chapter_number}</p><h1 className="page-title">{chapter.title}</h1><p className="mt-3 text-sm leading-6 text-muted">{chapter.summary}</p></div><div className="space-y-4">{(chapter.steps ?? []).map((step) => <Card key={step.id} className="p-5"><div className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-xs font-bold text-gold">{step.step_number}</span><div><h2 className="font-bold text-white">{step.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{step.description ?? "Step details unavailable."}</p>{step.objective && <p className="mt-4 rounded-lg border border-emerald/20 bg-emerald/5 p-3 text-xs text-emerald"><strong>Objective:</strong> {step.objective}</p>}{step.recommended_level && <p className="mt-3 text-xs text-gold">Recommended level: {step.recommended_level}</p>}</div></div></Card>)}</div></div>;
}
