"use client";

import { Package, Search } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useItems, useGame } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function ItemsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const [search, setSearch] = useState("");
  const game = useGame(gameId);
  const items = useItems(search);
  if (game.isLoading || items.isLoading) return <LoadingState label="Loading items..." />;
  if (game.isError || items.isError) return <ErrorState message={(game.error ?? items.error)?.message} />;
  return <div className="space-y-8"><div><p className="eyebrow">{game.data?.name} · Reference</p><h1 className="page-title">Items</h1><p className="mt-3 text-sm text-muted">Reference item effects available from the backend. Location-specific acquisitions are shown on location pages.</p></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search items..." className="h-11 w-full rounded-xl border border-line bg-panel pl-9 pr-4 text-sm outline-none focus:border-gold" /></div>{!items.data?.data.length ? <EmptyState title="No items found" description="Try another search term." /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.data.data.map((item) => <Card className="p-5" key={item.id}><Package className="text-gold" size={20} /><h2 className="mt-5 font-bold text-white">{item.name}</h2><p className="mt-1 text-xs capitalize text-muted">{item.category}</p><p className="mt-4 text-sm leading-5 text-muted">{item.effect ?? "Effect unavailable."}</p></Card>)}</div>}</div>;
}
