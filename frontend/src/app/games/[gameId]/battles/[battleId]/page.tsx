"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBattle, useGame } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function BattlePage() {
  const { gameId, battleId } = useParams<{ gameId: string; battleId: string }>();
  const game = useGame(gameId);
  const battle = useBattle(gameId, battleId);
  if (game.isLoading || battle.isLoading) return <LoadingState />;
  if (game.isError || battle.isError) return <ErrorState message={(game.error ?? battle.error)?.message} />;
  if (!battle.data) return <EmptyState title="Battle unavailable" description="This battle is not published for the selected game." />;
  const data = battle.data;
  return <div className="mx-auto max-w-4xl space-y-8"><div><Link href={`/games/${gameId}/battles`} className="text-xs font-semibold text-gold">← Back to battles</Link><p className="eyebrow mt-6">{game.data?.name} · Sequence {data.sequence_number}</p><h1 className="page-title">{data.name}</h1><p className="mt-3 text-sm leading-6 text-muted">{data.notes ?? "Strategy notes unavailable."}</p></div><div className="space-y-4">{(data.trainers ?? []).map((entry) => <Card key={`${entry.order_index}-${entry.trainer.id}`} className="p-5"><h2 className="font-bold text-white">{entry.trainer.name}</h2><p className="mt-1 text-xs text-muted">{entry.trainer.class_name ?? "Trainer"} · {entry.trainer.pokemon?.length ?? 0} Pokémon</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{(entry.trainer.pokemon ?? []).map((member) => <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-3 text-sm" key={member.position}><span className="font-semibold text-white">{member.pokemon.name}</span><span className="text-xs text-gold">Lv. {member.level}</span></div>)}</div></Card>)}</div>{!data.trainers?.length && <EmptyState title="Trainer details unavailable" description="This battle has no published trainer party data yet." />}</div>;
}
