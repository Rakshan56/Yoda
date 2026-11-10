"use client";

import Link from "next/link";
import { ArrowUpRight, Gamepad2, Search } from "lucide-react";
import { useState } from "react";
import { useGameOverview, useGames, useProgress } from "@/hooks/use-game-content";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";
import { gamePath } from "@/lib/game-routes";

const cardDetails = {
  firered: { background: "from-orange-500 via-red-700 to-red-950", pokemon: "Charizard", artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png", region: "Kanto" },
  leafgreen: { background: "from-lime-400 via-green-700 to-emerald-950", pokemon: "Venusaur", artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png", region: "Kanto" },
  emerald: { background: "from-green-900 via-emerald-950 to-[#071b16]", pokemon: "Rayquaza", artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png", region: "Hoenn" },
  ruby: { background: "from-red-400 via-red-800 to-rose-950", pokemon: "Groudon", artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/383.png", region: "Hoenn" },
  sapphire: { background: "from-blue-400 via-blue-800 to-slate-950", pokemon: "Kyogre", artwork: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/382.png", region: "Hoenn" }
} as const;

function GameCard({ game, status }: { game: NonNullable<ReturnType<typeof useGames>["data"]>["data"][number]; status?: string }) {
  const overview = useGameOverview(game.id);
  const details = cardDetails[game.id as keyof typeof cardDetails] ?? cardDetails.emerald;
  const counts = overview.data?.counts ?? {};
  return <article className={`adventure-game-card group relative flex aspect-[1/1.08] min-w-0 w-full flex-col rounded-[1.15rem] border border-white/20 bg-gradient-to-br ${details.background} p-4 shadow-2xl transition hover:-translate-y-3 hover:scale-[1.02] sm:p-5`}>
    <Link href={gamePath(game.id)} className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between"><span className="text-[9px] font-semibold text-white/80">Pokémon</span><Gamepad2 size={15} className="text-white/80" /></div>
      <h2 className="mt-1 text-xl font-black leading-none sm:text-2xl">{game.name.replace("Pokémon ", "")}</h2>
      <div className="home-card-art mt-5 flex min-h-0 flex-1 items-center justify-center sm:mt-6"><img src={details.artwork} alt={details.pokemon} className="h-full max-h-36 w-full object-contain drop-shadow-[0_12px_12px_rgba(0,0,0,.4)] transition duration-500 group-hover:scale-110 group-hover:-rotate-3" /></div>
      <p className="mt-4 min-h-10 text-xs leading-5 text-white/75">{game.description ?? "Explore this game’s published guide data."}</p>
      <div className="mt-4 flex items-center justify-between text-[8px] uppercase tracking-[.2em] text-white/70"><span>{details.region} · RPG</span><span className="text-white/90">{status === "COMPLETE" ? "Complete" : status === "IN_PROGRESS" ? "In progress" : "Not started"}</span></div>
    </Link>
    <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-white/20 pt-3 text-center text-[9px] text-white/80">
      <Link href={`/pokedex?game=${game.id}`} className="rounded-lg bg-black/15 px-1 py-1.5 hover:bg-white/20"><strong className="block text-white">{counts.pokemon ?? "—"}</strong>Pokémon</Link>
      <Link href={`${gamePath(game.id)}/walkthrough`} className="rounded-lg bg-black/15 px-1 py-1.5 hover:bg-white/20"><strong className="block text-white">{counts.walkthrough_chapters ?? "—"}</strong>Walkthrough</Link>
      <Link href={`${gamePath(game.id)}/battles`} className="rounded-lg bg-black/15 px-1 py-1.5 hover:bg-white/20"><strong className="block text-white">{counts.battles ?? "—"}</strong>Battles</Link>
    </div>
  </article>;
}

export default function GamesPage() {
  const [search, setSearch] = useState("");
  const games = useGames(search);
  const progress = useProgress();
  if (games.isLoading) return <LoadingState label="Loading your game library..." />;
  if (games.isError) return <ErrorState message={games.error.message} onRetry={() => games.refetch()} />;
  const items = games.data?.data ?? [];
  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">Your adventure library</p><h1 className="page-title">Choose your <span className="text-gold">game.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Five Generation III journeys, one place to plan every route, battle and milestone.</p></div><div className="relative w-full md:w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search games..." className="h-10 w-full rounded-xl border border-line bg-panel pl-9 pr-3 text-sm outline-none focus:border-gold" /></div></div>
    {!items.length ? <EmptyState title="No games found" description="Try a different search term." /> : <div className="adventure-card-grid mx-auto grid w-full max-w-[1120px] gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map((game) => <GameCard key={game.id} game={game} status={progress.data?.find((item) => item.game_id === game.id)?.status} />)}</div>}
  </div>;
}
