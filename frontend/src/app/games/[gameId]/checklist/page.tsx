"use client";

import { Check, ClipboardCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useChecklist, useGame } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function ChecklistPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = useGame(gameId);
  const checklist = useChecklist(gameId);
  const [complete, setComplete] = useState<string[]>([]);
  if (game.isLoading || checklist.isLoading) return <LoadingState label="Loading checklist..." />;
  if (game.isError || checklist.isError) return <ErrorState message={(game.error ?? checklist.error)?.message} />;
  const categories = checklist.data?.categories ?? [];
  const allItems = categories.flatMap((category) => category.items);
  const percentage = allItems.length ? Math.round((complete.length / allItems.length) * 100) : 0;
  const toggle = (id: string) => setComplete((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <div className="space-y-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow">{game.data?.name} · Completion</p><h1 className="page-title">Checklist</h1><p className="mt-3 text-sm text-muted">Track story, badges, key items, and optional milestones from the published template.</p></div><div className="text-right"><p className="text-3xl font-black text-gold">{percentage}%</p><p className="text-xs text-muted">{complete.length}/{allItems.length} checked</p></div></div>{checklist.data?.completeness !== "complete" && <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-xs text-gold">This checklist is marked <strong>{checklist.data?.completeness}</strong> by the backend. Completion changes are currently local to this session because no checklist mutation endpoint is available.</div>}{!categories.length ? <EmptyState title="Checklist not imported" description="Checklist templates will appear after the game data is reviewed." /> : <div className="space-y-4">{categories.map((category) => <Card className="p-5" key={category.id}><div className="flex items-center gap-2"><ClipboardCheck className="text-gold" size={18} /><h2 className="font-bold text-white">{category.title}</h2></div><div className="mt-4 space-y-2">{category.items.map((item) => <button key={item.id} onClick={() => toggle(item.id)} className="flex w-full items-start gap-3 rounded-xl bg-white/[0.03] p-3 text-left hover:bg-white/[0.06]"><span className={complete.includes(item.id) ? "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-emerald text-ink" : "mt-0.5 h-5 w-5 shrink-0 rounded-md border border-line"}>{complete.includes(item.id) && <Check size={13} />}</span><span><span className={complete.includes(item.id) ? "text-sm text-muted line-through" : "text-sm text-white"}>{item.title}</span>{item.description && <span className="mt-1 block text-xs text-muted">{item.description}</span>}</span></button>)}</div></Card>)}</div>}</div>;
}
