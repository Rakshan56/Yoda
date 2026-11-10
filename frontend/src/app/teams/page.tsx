"use client";

import Link from "next/link";
import { Plus, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCreateTeam, useDeleteTeam, useGames, useTeams } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";
import { GAME_IDS, type GameId } from "@/types/api";

export default function TeamsPage() {
  const teams = useTeams();
  const games = useGames();
  const create = useCreateTeam();
  const remove = useDeleteTeam();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState<GameId>("emerald");
  if (teams.isLoading) return <LoadingState label="Loading your teams..." />;
  if (teams.isError) return <ErrorState message={teams.error.message} onRetry={() => teams.refetch()} />;
  const submit = async () => {
    if (!name.trim()) return;
    try {
      await create.mutateAsync({ name: name.trim(), game_id: gameId });
      setName("");
      setCreating(false);
    } catch {
      // The mutation error is rendered beside the form.
    }
  };
  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Build your squad</p><h1 className="page-title">Team builder</h1><p className="mt-3 text-sm text-muted">Create game-specific teams and plan six slots around the Generation III ruleset.</p></div><Button onClick={() => setCreating((value) => !value)}><Plus size={16} /> New team</Button></div>
    {creating && <Card className="grid gap-3 p-5 sm:grid-cols-[1fr_180px_auto]"><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Team name" className="h-10 rounded-xl border border-line bg-white/[0.03] px-3 text-sm outline-none focus:border-gold" /><select value={gameId} onChange={(event) => setGameId(event.target.value as GameId)} className="h-10 rounded-xl border border-line bg-white/[0.03] px-3 text-sm capitalize text-white outline-none">{games.data?.data.map((game) => <option key={game.id} value={game.id}>{game.name}</option>) ?? GAME_IDS.map((id) => <option key={id} value={id}>{id}</option>)}</select><Button onClick={submit} disabled={create.isPending || !name.trim()}>{create.isPending ? "Creating..." : "Create"}</Button>{create.isError && <p className="text-xs text-red-300 sm:col-span-3">{create.error.message}</p>}</Card>}
    {!teams.data?.length ? <EmptyState title="No teams yet" description="Create a team to start filling your six slots." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{teams.data.map((team) => <Card className="p-5" key={team.id}><div className="flex items-start justify-between"><Shield className="text-gold" size={21} /><button aria-label={`Delete ${team.name}`} disabled={remove.isPending} onClick={() => { if (window.confirm(`Delete "${team.name}"?`)) remove.mutate(team.id); }} className="text-muted hover:text-red-300"><Trash2 size={16} /></button></div><Link href={`/teams/${team.id}`}><h2 className="mt-6 font-bold capitalize text-white hover:text-gold">{team.name}</h2><p className="mt-1 text-xs capitalize text-muted">{team.game?.name ?? team.gameId} · {team.members?.length ?? 0}/6 slots</p><div className="mt-5 grid grid-cols-6 gap-2">{Array.from({ length: 6 }, (_, index) => <span className="grid h-8 place-items-center rounded-lg border border-line text-xs text-muted" key={index}>{team.members?.find((member) => member.slot === index + 1)?.pokemon?.name?.slice(0, 2).toUpperCase() ?? "—"}</span>)}</div></Link></Card>)}</div>}
    {remove.isError && <p className="text-xs text-red-300">{remove.error.message}</p>}
    {games.isError && <p className="text-xs text-muted">Game names could not be loaded; canonical game IDs are still available.</p>}
  </div>;
}
