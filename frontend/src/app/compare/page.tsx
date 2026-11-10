"use client";

import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { usePokemonCompare, usePokemonList } from "@/hooks/use-game-content";
import { PokemonCard } from "@/components/pokemon/pokemon-card";
import { StatBars } from "@/components/pokemon/stat-bars";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";
import type { Pokemon } from "@/types/api";

export default function ComparePage() {
  return <Suspense fallback={<LoadingState label="Loading comparison..." />}><CompareContent /></Suspense>;
}

function CompareContent() {
  const params = useSearchParams();
  const initial = params.get("ids")?.split(",").filter(Boolean) ?? [];
  const [ids, setIds] = useState(initial);
  const [search, setSearch] = useState("");
  const list = usePokemonList(search);
  const compare = usePokemonCompare(ids);
  const selected = compare.data ?? [];
  const add = (pokemon: Pokemon) => setIds((current) => current.includes(pokemon.id) || current.length >= 6 ? current : [...current, pokemon.id]);
  if (compare.isLoading && ids.length >= 2) return <LoadingState label="Loading comparison..." />;
  if (compare.isError) return <ErrorState message={compare.error.message} onRetry={() => compare.refetch()} />;
  return <div className="space-y-8"><div><p className="eyebrow">Team planning tool</p><h1 className="page-title">Compare Pokémon</h1><p className="mt-3 text-sm leading-6 text-muted">Select two to six published records and compare their Generation III base stats side by side.</p></div><Card className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a Pokémon to add..." className="h-10 w-full rounded-xl border border-line bg-white/[0.03] pl-9 pr-4 text-sm outline-none focus:border-gold" /></div>{search && <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-4">{(list.data?.data ?? []).slice(0, 8).map((pokemon) => <PokemonCard key={pokemon.id} pokemon={pokemon} selected={ids.includes(pokemon.id)} onSelect={add} />)}</div>}</Card>{selected.length < 2 ? <EmptyState title="Choose at least two Pokémon" description="Search above and select records to begin comparing." /> : <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{selected.map((pokemon) => <Card className="relative p-4" key={pokemon.id}><button aria-label={`Remove ${pokemon.name}`} onClick={() => setIds((current) => current.filter((id) => id !== pokemon.id))} className="absolute right-3 top-3 text-muted hover:text-white"><X size={16} /></button><div className="flex items-center gap-3">{pokemon.sprites.front && <img src={pokemon.sprites.front} alt="" className="h-16 w-16 [image-rendering:pixelated]" />}<div><p className="font-bold capitalize text-white">{pokemon.name}</p><p className="text-xs text-muted">#{String(pokemon.species.national_dex_number).padStart(3, "0")}</p></div></div><div className="mt-4"><StatBars value={pokemon.stats} /></div><Link href={`/pokemon/${pokemon.id}`} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-gold">View details <ArrowRight size={14} /></Link></Card>)}</div><Button variant="ghost" onClick={() => setIds([])}>Clear comparison</Button></>}</div>;
}
