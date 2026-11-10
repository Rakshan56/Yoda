"use client";

import Link from "next/link";
import { MapPinned, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useGame, useLocations } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function LocationsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [search, setSearch] = useState("");
  const game = useGame(gameId);
  const locations = useLocations(gameId, search);
  if (game.isLoading || locations.isLoading) return <LoadingState label="Loading locations..." />;
  if (game.isError || locations.isError) return <ErrorState message={(game.error ?? locations.error)?.message} />;
  const items = locations.data?.data ?? [];
  return <div className="space-y-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">{game.data?.name} · World guide</p><h1 className="page-title">Locations</h1><p className="mt-3 text-sm text-muted">Routes and places with published details for this version.</p></div><div className="relative w-full md:w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search locations..." className="h-10 w-full rounded-xl border border-line bg-panel pl-9 pr-3 text-sm outline-none focus:border-gold" /></div></div>{!items.length ? <EmptyState title="No published locations" description="Try another search or check back after source review." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((location) => <Link href={`/games/${gameId}/locations/${location.id}`} key={location.id}><Card className="h-full p-5 transition hover:-translate-y-1 hover:border-gold"><MapPinned className="text-gold" size={20} /><h2 className="mt-7 font-bold text-white">{location.name}</h2><p className="mt-1 text-xs text-muted">{location.region}</p><p className="mt-4 line-clamp-2 text-sm leading-5 text-muted">{location.description ?? "Location details unavailable."}</p></Card></Link>)}</div>}</div>;
}
