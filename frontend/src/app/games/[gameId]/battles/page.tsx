"use client";

import Link from "next/link";
import { ArrowRight, MapPinned, Swords } from "lucide-react";
import { useParams } from "next/navigation";
import { useBattles, useGame } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/shared/query-state";

export default function BattlesPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = useGame(gameId);
  const battles = useBattles(gameId);
  if (game.isLoading || battles.isLoading) return <LoadingState label="Loading battle guides..." />;
  if (game.isError || battles.isError) return <ErrorState message={(game.error ?? battles.error)?.message} />;
  return <div className="space-y-8"><div><p className="eyebrow">{game.data?.name} · Strategy</p><h1 className="page-title">Major battles</h1><p className="mt-3 text-sm text-muted">Prepare with published trainer parties and source-backed strategies.</p></div>{!battles.data?.length ? <div className="rounded-2xl border border-dashed border-line p-10 text-center"><Swords className="mx-auto text-gold" size={28} /><p className="mt-4 font-semibold text-white">Battle data is not published yet</p><p className="mx-auto mt-2 max-w-lg text-sm text-muted">This game has no reviewed battle guides in the backend yet. You can still explore its available locations and walkthrough content.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href={`/games/${gameId}/locations`} className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink"><MapPinned size={15} /> Explore locations</Link><Link href={`/games/${gameId}/walkthrough`} className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-white">Open walkthrough <ArrowRight size={15} /></Link><Link href={`/games/${gameId}`} className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-white">Game overview</Link></div></div> : <div className="grid gap-4 md:grid-cols-2">{battles.data.map((battle) => <Link href={`/games/${gameId}/battles/${battle.id}`} key={battle.id}><Card className="p-5 transition hover:-translate-y-1 hover:border-gold"><Swords className="text-gold" size={20} /><div className="mt-7 flex items-start justify-between gap-3"><div><h2 className="font-bold text-white">{battle.name}</h2><p className="mt-1 text-xs text-muted">{battle.battle_type ?? "Battle"} · Sequence {battle.sequence_number}</p></div><span className="rounded-full bg-gold/10 px-2 py-1 text-[10px] font-bold text-gold">Open</span></div><p className="mt-4 text-sm text-muted">{battle.notes ?? "Open this guide for trainers and strategy notes."}</p></Card></Link>)}</div>}</div>;
}
