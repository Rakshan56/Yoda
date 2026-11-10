"use client";

import { ExternalLink, FileText } from "lucide-react";
import { useCredits } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function CreditsPage() {
  const credits = useCredits();
  if (credits.isLoading) return <LoadingState label="Loading source credits..." />;
  if (credits.isError) return <ErrorState message={credits.error.message} onRetry={() => credits.refetch()} />;
  return <div className="mx-auto max-w-4xl space-y-8"><div><p className="eyebrow">Source registry</p><h1 className="page-title">Credits & sources</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Yoda is an independent educational fan project. It is not affiliated with Nintendo, Game Freak, or The Pokémon Company.</p></div>{!credits.data?.sources.length ? <EmptyState title="No source credits published" description="Source attribution will appear when registry records are available." /> : <div className="space-y-4">{credits.data.sources.map((source) => <Card className="p-5" key={source.source_id}><div className="flex items-start gap-3"><FileText className="mt-1 text-gold" size={19} /><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold text-white">{source.name}</h2><a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-gold">Open source <ExternalLink size={13} /></a></div><p className="mt-2 text-sm text-muted">{source.credit_text}</p>{source.organization && <p className="mt-3 text-xs text-muted">{source.organization}</p>}{source.license_notes && <p className="mt-3 rounded-lg bg-white/[0.03] p-3 text-xs leading-5 text-muted">{source.license_notes}</p>}</div></div></Card>)}</div>}<Card className="border-gold/20 bg-gold/5 p-5 text-sm leading-6 text-muted">Pokémon and related marks belong to their respective owners. This application is for educational and informational use.</Card></div>;
}
