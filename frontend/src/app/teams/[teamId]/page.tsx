"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Save, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAddTeamMember, usePokemonList, useTeamAnalysis, useTeams } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const teams = useTeams();
  const team = teams.data?.find((item) => item.id === teamId);
  const [search, setSearch] = useState("");
  const [slot, setSlot] = useState(1);
  const [level, setLevel] = useState(50);
  const pokemon = usePokemonList(search, team?.gameId);
  const add = useAddTeamMember(teamId);
  const analysis = useTeamAnalysis();
  if (teams.isLoading) return <LoadingState label="Loading team..." />;
  if (teams.isError) return <ErrorState message={teams.error.message} onRetry={() => teams.refetch()} />;
  if (!team) return <EmptyState title="Team unavailable" description="This team was not found or is not accessible." />;
  const memberIds = team.members?.map((member) => member.pokemonId) ?? [];
  const addMember = async (pokemonId: string) => {
    try {
      await add.mutateAsync({ pokemon_id: pokemonId, slot, level });
      setSearch("");
    } catch {
      // The mutation error is rendered in the picker.
    }
  };
  return <div className="space-y-8"><div><Link href="/teams" className="inline-flex items-center gap-2 text-xs font-semibold text-gold"><ArrowLeft size={14} /> Back to teams</Link><p className="eyebrow mt-6">{team.game?.name ?? team.gameId} · Team builder</p><h1 className="page-title capitalize">{team.name}</h1><p className="mt-3 text-sm text-muted">{team.description ?? "Configure six team slots for your adventure."}</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => { const member = team.members?.find((item) => item.slot === index + 1); return <Card className={`min-h-44 p-5 ${slot === index + 1 ? "border-gold" : ""}`} key={index}><div className="flex items-center justify-between"><button type="button" onClick={() => setSlot(index + 1)} className="text-xs font-bold text-gold">SLOT {index + 1}</button>{member && <span className="text-xs text-emerald">Ready</span>}</div>{member ? <div className="mt-6 flex items-center gap-3">{member.pokemon?.spriteFront && <img src={member.pokemon.spriteFront} alt="" className="h-16 w-16 [image-rendering:pixelated]" />}<div><p className="font-bold capitalize text-white">{member.pokemon?.name ?? member.pokemonId}</p><p className="mt-1 text-xs text-muted">Level {member.level ?? "—"}{member.nature ? ` · ${member.nature}` : ""}</p></div></div> : <button onClick={() => setSlot(index + 1)} className="mt-12 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-xs text-muted hover:border-gold hover:text-gold"><Plus size={15} /> Fill this slot</button>}</Card>; })}</div><Card className="p-5"><div className="flex items-center gap-2"><Users size={18} className="text-gold" /><h2 className="font-bold">Add a Pokémon</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_100px_100px]"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Pokémon..." className="h-10 rounded-xl border border-line bg-white/[0.03] px-3 text-sm outline-none focus:border-gold" /><select value={slot} onChange={(event) => setSlot(Number(event.target.value))} className="h-10 rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-white outline-none">{Array.from({ length: 6 }, (_, index) => <option value={index + 1} key={index}>Slot {index + 1}</option>)}</select><input type="number" min={1} max={100} value={level} onChange={(event) => setLevel(Number(event.target.value))} className="h-10 rounded-xl border border-line bg-white/[0.03] px-3 text-sm outline-none focus:border-gold" /></div>{search && <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{(pokemon.data?.data ?? []).slice(0, 8).map((item) => <button type="button" disabled={add.isPending} onClick={() => addMember(item.id)} className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] p-2 text-left text-sm hover:border-gold disabled:opacity-50" key={item.id}>{item.sprites.front && <img src={item.sprites.front} alt="" className="h-10 w-10 [image-rendering:pixelated]" />}<span className="capitalize text-white">{item.name}</span></button>)}</div>}{add.isError && <p className="mt-3 text-xs text-red-300">{add.error.message}</p>}<div className="mt-5 flex flex-wrap gap-3"><Button variant="secondary" onClick={() => analysis.mutate({ game_id: team.gameId, pokemon_ids: memberIds })} disabled={memberIds.length === 0 || analysis.isPending}><Save size={15} /> Analyze coverage</Button>{analysis.data && <span className="self-center text-xs text-muted">{Object.keys(analysis.data.weaknesses ?? {}).length} weaknesses identified.</span>}{analysis.isError && <span className="self-center text-xs text-red-300">{analysis.error.message}</span>}</div></Card></div>;
}
