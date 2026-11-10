"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, ChevronRight, LockKeyhole } from "lucide-react";
import { useParams } from "next/navigation";
import { useGame, useWalkthrough } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/shared/query-state";

export default function WalkthroughPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = useGame(gameId);
  const walkthrough = useWalkthrough(gameId);
  if (game.isLoading || walkthrough.isLoading) return <LoadingState label="Loading walkthrough..." />;
  if (game.isError || walkthrough.isError) return <ErrorState message={(game.error ?? walkthrough.error)?.message} onRetry={() => { void game.refetch(); void walkthrough.refetch(); }} />;
  const chapters = walkthrough.data ?? [];
  return <div className="space-y-8"><div><p className="eyebrow">{game.data?.name} · Story guide</p><h1 className="page-title">Walkthrough</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">A source-backed route through the adventure. Unpublished chapters remain intentionally hidden.</p></div>{!chapters.length ? <div className="rounded-2xl border border-dashed border-line p-10 text-center"><BookOpen className="mx-auto text-gold" size={28} /><p className="mt-4 font-semibold text-white">Walkthrough data is not published yet</p><p className="mx-auto mt-2 max-w-lg text-sm text-muted">This game has no reviewed walkthrough chapters in the backend yet. Explore the available guide sections while content is being prepared.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href={`/games/${gameId}/locations`} className="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink">Explore locations</Link><Link href={`/games/${gameId}/battles`} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-white">View battles</Link><Link href={`/games/${gameId}`} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-white">Game overview</Link></div></div> : <div className="space-y-4">{chapters.map((chapter) => <Card key={chapter.id} className="p-5"><div className="flex gap-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/10 text-sm font-black text-gold">{String(chapter.chapter_number).padStart(2, "0")}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-white">{chapter.title}</h2><p className="mt-1 text-sm text-muted">{chapter.summary ?? "Chapter summary unavailable."}</p></div><Link href={`/games/${gameId}/walkthrough/${chapter.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-gold">Open chapter <ChevronRight size={14} /></Link></div><div className="mt-5 space-y-2">{(chapter.steps ?? []).slice(0, 3).map((step) => <div key={step.id} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2 text-sm"><CheckCircle2 size={16} className="text-muted" /><span className="text-muted">{step.title}</span>{step.recommended_level && <span className="ml-auto text-xs text-gold">Lv. {step.recommended_level}</span>}</div>)}{!chapter.steps?.length && <div className="flex items-center gap-2 text-xs text-muted"><LockKeyhole size={14} /> Chapter steps unavailable</div>}</div></div></div></Card>)}</div>}</div>;
}
