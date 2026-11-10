"use client";

import { Check, Search } from "lucide-react";
import { useState } from "react";
import { useCollection, useGames, usePokemonList, useUpdateCollection } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";
import { GAME_IDS, type GameId } from "@/types/api";

export default function CollectionPage() {
  const [gameId, setGameId] = useState<GameId>("emerald");
  const [search, setSearch] = useState("");
  const collection = useCollection(gameId);
  const pokemon = usePokemonList(search, gameId);
  const update = useUpdateCollection(gameId);
  const games = useGames();
  if (collection.isLoading || pokemon.isLoading) return <LoadingState label="Loading your collection..." />;
  if (collection.isError || pokemon.isError) return <ErrorState message={(collection.error ?? pokemon.error)?.message} />;
  const entries = collection.data ?? [];
  const statuses = new Map(entries.map((entry) => [entry.pokemon_id, entry.status]));
  return <div className="space-y-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Track your journey</p><h1 className="page-title">Collection</h1><p className="mt-3 text-sm text-muted">Mark Pokémon as seen, caught, owned, or wanted for each game.</p></div><select value={gameId} onChange={(event) => setGameId(event.target.value as GameId)} className="h-10 rounded-xl border border-line bg-panel px-3 text-sm capitalize text-white outline-none">{(games.data?.data ?? GAME_IDS.map((id) => ({ id, name: id } as never))).map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Pokémon to update..." className="h-11 w-full rounded-xl border border-line bg-panel pl-9 pr-4 text-sm outline-none focus:border-gold" /></div><div className="flex items-center justify-between text-xs text-muted"><span>{entries.filter((entry) => ["CAUGHT", "OWNED"].includes(entry.status)).length} caught or owned</span><span>{entries.length} tracked</span></div>{!pokemon.data?.data.length ? <EmptyState title="No Pokémon found" description="Try another search or choose a different game." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{pokemon.data.data.map((item) => { const status = statuses.get(item.id); return <Card className="flex items-center gap-3 p-3" key={item.id}>{item.sprites.front && <img src={item.sprites.front} alt="" className="h-14 w-14 [image-rendering:pixelated]" />}<div className="min-w-0 flex-1"><p className="truncate font-semibold capitalize text-white">{item.name}</p><p className="text-xs text-muted">{status ?? "Not tracked"}</p></div><button aria-label={`Mark ${item.name} as caught`} disabled={update.isPending} onClick={() => update.mutate({ pokemonId: item.id, status: status === "CAUGHT" ? "SEEN" : "CAUGHT" })} className={status === "CAUGHT" || status === "OWNED" ? "grid h-8 w-8 place-items-center rounded-lg bg-emerald/20 text-emerald" : "grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:border-gold hover:text-gold"}><Check size={15} /></button></Card>; })}</div>}</div>;
}
