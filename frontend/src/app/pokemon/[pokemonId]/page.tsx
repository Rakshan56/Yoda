"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { usePokemon, usePokemonRelations } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";
import { StatBars } from "@/components/pokemon/stat-bars";

export default function PokemonDetailPage() {
  const { pokemonId } = useParams<{ pokemonId: string }>();
  const pokemon = usePokemon(pokemonId);
  const relations = usePokemonRelations(pokemonId);
  if (pokemon.isLoading) return <LoadingState label="Loading Pokémon details..." />;
  if (pokemon.isError) return <ErrorState message={pokemon.error.message} onRetry={() => pokemon.refetch()} />;
  if (!pokemon.data) return <EmptyState title="Pokémon unavailable" description="This record was not found in the backend." />;
  const data = pokemon.data;
  return <div className="space-y-8">
    <div><Link href="/pokedex" className="text-xs font-semibold text-gold">← Back to Pokédex</Link><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">#{String(data.species.national_dex_number).padStart(3, "0")} · Generation {data.species.generation}</p><h1 className="page-title capitalize">{data.name}</h1><div className="mt-3 flex flex-wrap gap-2">{data.types.map((type) => <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-bold capitalize text-gold" key={type.slot}>{type.name}</span>)}</div></div><Link className="sm:ml-auto" href={`/compare?ids=${data.id}`}><span className="inline-flex items-center gap-2 text-xs font-semibold text-gold">Add to comparison <ArrowRight size={14} /></span></Link></div></div>
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><Card className="relative overflow-hidden bg-gradient-to-br from-emerald/10 to-gold/5 p-6"><div className="absolute right-4 top-4 font-mono text-xs text-muted">#{String(data.species.national_dex_number).padStart(3, "0")}</div><div className="grid min-h-72 place-items-center">{data.sprites.front ? <img src={data.sprites.front} alt={data.name} className="h-64 w-64 object-contain [image-rendering:pixelated]" /> : <span className="text-8xl font-black text-white/10">?</span>}</div><div className="grid gap-3 text-center sm:grid-cols-3"><Metric label="Height" value={`${data.height / 10} m`} /><Metric label="Weight" value={`${data.weight / 10} kg`} /><Metric label="Base XP" value={String(data.base_experience)} /></div></Card><Card className="p-6"><div className="flex items-center gap-2"><Sparkles size={18} className="text-gold" /><h2 className="font-bold">Base stats</h2></div><div className="mt-6"><StatBars value={data.stats} /></div></Card></div>
    <div className="grid gap-5 lg:grid-cols-2"><Card className="p-6"><h2 className="font-bold">Species information</h2><p className="mt-4 text-sm leading-6 text-muted">{data.species.description ?? "Description unavailable."}</p><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Metric label="Capture rate" value={String(data.species.capture_rate)} /><Metric label="Growth rate" value={data.species.growth_rate.replaceAll("_", " ")} /><Metric label="Base happiness" value={String(data.species.base_happiness)} /><Metric label="Category" value={data.species.is_legendary ? "Legendary" : data.species.is_mythical ? "Mythical" : "Standard"} /></div></Card><Card className="p-6"><h2 className="font-bold">Abilities</h2><div className="mt-4 space-y-3">{data.abilities.length ? data.abilities.map((ability) => <div className="rounded-xl bg-white/[0.03] p-3" key={ability.slot}><p className="font-semibold capitalize text-white">{ability.name}</p><p className="mt-1 text-xs leading-5 text-muted">{ability.effect ?? "Effect unavailable."}</p></div>) : <p className="text-sm text-muted">Abilities unavailable.</p>}</div></Card></div>
    <Card className="p-6"><h2 className="font-bold">Evolution data</h2>{relations.evolutions.data?.data_available ? <div className="mt-4 space-y-3">{relations.evolutions.data.evolutions.map((evolution) => <div className="flex flex-wrap items-center gap-3 text-sm" key={evolution.id}><span className="font-semibold capitalize text-white">{evolution.from_species.name}</span><ArrowRight size={15} className="text-gold" /><span className="font-semibold capitalize text-white">{evolution.to_species.name}</span><span className="text-xs text-muted">{evolution.item?.name ?? evolution.trigger ?? "Condition available in API record"}</span></div>)}</div> : <p className="mt-3 text-sm text-muted">Evolution data is unavailable for this record.</p>}</Card>
    <Card className="p-6"><div className="flex items-center gap-2"><MapPin size={18} className="text-gold" /><h2 className="font-bold">Game availability</h2></div>{relations.encounters.data?.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{relations.encounters.data.map((encounter) => <div className="rounded-xl bg-white/[0.03] p-3" key={encounter.id}><div className="flex justify-between gap-3"><span className="font-semibold text-white">{encounter.game_name}</span><span className="text-xs text-gold">Lv. {encounter.min_level}–{encounter.max_level}</span></div><p className="mt-1 text-xs text-muted">{encounter.location.name} · {encounter.method}</p></div>)}</div> : <p className="mt-3 text-sm text-muted">No encounter records are available.</p>}</Card>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-muted">{label}</p><p className="mt-1 text-sm font-bold capitalize text-white">{value}</p></div>;
}
