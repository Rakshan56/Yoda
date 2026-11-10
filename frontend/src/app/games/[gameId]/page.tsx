"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, MapPinned, Swords } from "lucide-react";
import { useParams } from "next/navigation";
import { useGameOverview } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";
import { GameProgress } from "@/components/games/game-progress";

export default function GameOverviewPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = useGameOverview(gameId);
  if (game.isLoading) return <LoadingState label="Loading game overview..." />;
  if (game.isError || !game.data) return <ErrorState message={game.error?.message} onRetry={() => game.refetch()} />;
  const data = game.data;
  const links = [{ href: `/games/${gameId}/walkthrough`, label: "Walkthrough", icon: BookOpen, description: "Follow the story chapter by chapter." }, { href: `/games/${gameId}/locations`, label: "Locations", icon: MapPinned, description: "Explore routes, encounters and items." }, { href: `/games/${gameId}/battles`, label: "Major battles", icon: Swords, description: "Prepare for the toughest fights." }];
  return <div className="space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">{data.region.name} · Generation {data.generation}</p><h1 className="page-title">{data.name}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{data.description ?? "A published game overview will appear here as source-backed content becomes available."}</p></div><GameProgress gameId={gameId as import("@/types/api").GameId} /></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(data.counts ?? {}).map(([key, value]) => <Card key={key} className="p-5"><p className="text-3xl font-black text-gold">{value}</p><p className="mt-1 text-xs capitalize text-muted">{key.replaceAll("_", " ")}</p></Card>)}</div>
    <div className="grid gap-5 md:grid-cols-3">{links.map(({ href, label, icon: Icon, description }) => <Link href={href} key={href}><Card className="h-full p-5 transition hover:-translate-y-1 hover:border-gold"><Icon className="text-gold" size={21} /><h2 className="mt-8 font-bold text-white">{label}</h2><p className="mt-2 text-sm leading-5 text-muted">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-gold">Open guide <ArrowRight size={14} /></span></Card></Link>)}</div>
    <Card className="flex flex-col justify-between gap-4 border-gold/20 bg-gold/5 p-6 sm:flex-row sm:items-center"><div><p className="font-semibold text-white">Keep your progress close</p><p className="mt-1 text-sm text-muted">Sign in to save your adventure milestones and checklist progress.</p></div><Link href="/login"><Button variant="secondary">Sign in</Button></Link></Card>
  </div>;
}
