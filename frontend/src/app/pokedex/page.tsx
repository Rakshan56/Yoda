"use client";

import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useGames, usePokemonList } from "@/hooks/use-game-content";
import { PokemonCard } from "@/components/pokemon/pokemon-card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";

const types = ["normal", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fighting", "poison", "ground", "rock", "bug", "ghost", "steel"];

export default function PokedexPage() {
  const [search, setSearch] = useState("");
  const [gameId, setGameId] = useState("");
  const [type, setType] = useState("");
  useEffect(() => {
    const selectedGame = new URLSearchParams(window.location.search).get("game_id");
    if (selectedGame) setGameId(selectedGame);
  }, []);
  const pokemon = usePokemonList(search, gameId, type);
  const games = useGames();
  if (pokemon.isLoading) return <LoadingState label="Loading the Pokédex..." />;
  if (pokemon.isError) return <ErrorState message={pokemon.error.message} onRetry={() => pokemon.refetch()} />;
  const items = pokemon.data?.data ?? [];
  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Generation III reference</p><h1 className="page-title">Pokédex</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Search published Pokémon records, compare base stats, and follow their game-specific availability.</p></div><Link href="/compare"><Button variant="secondary">Compare Pokémon <ArrowRight size={16} /></Button></Link></div>
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel/70 p-4 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name..." className="h-11 w-full rounded-xl border border-line bg-white/[0.03] pl-10 pr-4 text-sm outline-none focus:border-gold" /></div><div className="flex flex-wrap items-center gap-2 text-muted"><SlidersHorizontal size={16} /><select value={gameId} onChange={(event) => setGameId(event.target.value)} className="h-11 rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-white outline-none"><option value="">All games</option>{games.data?.data.map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value)} className="h-11 rounded-xl border border-line bg-white/[0.03] px-3 text-sm capitalize text-white outline-none"><option value="">All types</option>{types.map((item) => <option value={item} key={item}>{item}</option>)}</select></div></div>
    <div className="flex items-center justify-between text-xs text-muted"><span>{pokemon.data?.meta.total ?? 0} published records</span>{(search || gameId || type) && <button className="text-gold hover:text-white" onClick={() => { setSearch(""); setGameId(""); setType(""); }}>Clear filters</button>}</div>
    {!items.length ? <EmptyState title="No Pokémon found" description="Try another search or filter. Only records returned by the backend are shown." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((item) => <PokemonCard key={item.id} pokemon={item} />)}</div>}
  </div>;
}
