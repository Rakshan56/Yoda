"use client";

import Link from "next/link";
import { ArrowRight, Fish, Package, Swords } from "lucide-react";
import { useParams } from "next/navigation";
import { useGame, useLocation, useLocationContent } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function LocationPage() {
  const { gameId, locationId } = useParams<{ gameId: string; locationId: string }>();
  const game = useGame(gameId);
  const location = useLocation(gameId, locationId);
  const content = useLocationContent(gameId, locationId);
  if (game.isLoading || location.isLoading || content.connections.isLoading || content.encounters.isLoading || content.trainers.isLoading || content.items.isLoading) return <LoadingState label="Loading location guide..." />;
  if (game.isError || location.isError) return <ErrorState message={(game.error ?? location.error)?.message} />;
  if (!location.data) return <EmptyState title="Location unavailable" description="This location is not published for the selected game." />;
  const data = location.data;
  return <div className="space-y-8"><div><Link href={`/games/${gameId}/locations`} className="text-xs font-semibold text-gold">← Back to locations</Link><p className="eyebrow mt-6">{game.data?.name} · {data.region}</p><h1 className="page-title">{data.name}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{data.description ?? "Location details unavailable."}</p></div><div className="grid gap-5 lg:grid-cols-3"><Card className="min-h-60 overflow-hidden lg:col-span-2">{data.map_asset_url ? <img src={data.map_asset_url} alt={`Map of ${data.name}`} className="h-full min-h-60 w-full object-cover" /> : <div className="grid min-h-60 place-items-center bg-gradient-to-br from-emerald/10 to-gold/5 text-center"><div><MapIcon /><p className="mt-3 text-sm text-muted">Map asset unavailable</p></div></div>}</Card><Card className="p-5"><p className="eyebrow">Connections</p><div className="mt-4 space-y-3">{(content.connections.data ?? []).map((connection) => <div key={connection.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3 text-sm"><span>{connection.from.id === locationId ? connection.to.name : connection.from.name}</span><ArrowRight size={15} className="text-gold" /></div>)}{!content.connections.data?.length && <p className="text-sm text-muted">No published connections.</p>}</div></Card></div><div className="grid gap-5 lg:grid-cols-2"><InfoPanel icon={<Fish size={18} />} title="Pokémon encounters">{(content.encounters.data ?? []).map((entry) => <div className="flex items-center justify-between border-b border-line py-3 text-sm last:border-0" key={entry.id}><span className="font-semibold text-white">{entry.pokemon_name}<small className="ml-2 text-xs font-normal text-muted">{entry.method}</small></span><span className="text-xs text-gold">Lv. {entry.min_level}–{entry.max_level}</span></div>)}{!content.encounters.data?.length && <p className="text-sm text-muted">No published encounters.</p>}</InfoPanel><InfoPanel icon={<Swords size={18} />} title="Trainers">{(content.trainers.data ?? []).map((trainer) => <div className="border-b border-line py-3 last:border-0" key={trainer.id}><p className="font-semibold text-white">{trainer.name}</p><p className="mt-1 text-xs text-muted">{trainer.pokemon?.length ?? 0} Pokémon</p></div>)}{!content.trainers.data?.length && <p className="text-sm text-muted">No published trainers.</p>}</InfoPanel></div>  <Card className="p-5"><div className="flex items-center gap-2"><Package size={18} className="text-gold" /><h2 className="font-bold">Items</h2></div><div className="mt-4 space-y-3">{(content.items.data ?? []).map((entry) => <div className="flex items-center justify-between border-b border-line py-3 text-sm last:border-0" key={entry.id}><span className="font-semibold text-white">{entry.item.name}<small className="ml-2 text-xs font-normal text-muted">{entry.acquisition_method ?? "Found"}</small></span><span className="text-xs text-gold">×{entry.quantity}</span></div>)}{!content.items.data?.length && <p className="text-sm text-muted">No published items.</p>}</div></Card></div>;
}

function InfoPanel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <Card className="p-5"><div className="flex items-center gap-2">{icon}<h2 className="font-bold">{title}</h2></div><div className="mt-3">{children}</div></Card>;
}
function MapIcon() { return <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-gold/20 text-2xl text-gold">✦</div>; }
