"use client";

import { ShieldAlert, FileKey, TriangleAlert } from "lucide-react";
import { useCurrentUser, useAdminQualityIssues, useAdminReports, useAdminSources, useUpdateAdminReport } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/query-state";

export default function AdminPage() {
  const user = useCurrentUser();
  const issues = useAdminQualityIssues();
  const reports = useAdminReports();
  const sources = useAdminSources();
  const updateReport = useUpdateAdminReport();
  if (user.isLoading) return <LoadingState label="Checking admin access..." />;
  if (user.isError) return <ErrorState message="Sign in with an administrator account to access this dashboard." />;
  if (user.data?.role !== "ADMIN") return <div className="mx-auto max-w-xl py-16"><EmptyState title="Admin access required" description="Your account is authenticated, but backend authorization does not grant administrator access." /></div>;
  if (issues.isLoading || reports.isLoading || sources.isLoading) return <LoadingState label="Loading admin workspace..." />;
  if (issues.isError || reports.isError || sources.isError) return <ErrorState message={(issues.error ?? reports.error ?? sources.error)?.message} />;
  return <div className="space-y-8"><div><p className="eyebrow">Restricted workspace</p><h1 className="page-title">Admin dashboard</h1><p className="mt-3 text-sm text-muted">Review source-backed content quality and reports. The backend remains the authority for every action.</p></div><div className="grid gap-4 sm:grid-cols-3"><Metric icon={<TriangleAlert />} value={issues.data?.length ?? 0} label="Quality issues" /><Metric icon={<ShieldAlert />} value={reports.data?.length ?? 0} label="Content reports" /><Metric icon={<FileKey />} value={sources.data?.length ?? 0} label="Registered sources" /></div><div className="grid gap-5 lg:grid-cols-2"><Card className="p-5"><h2 className="font-bold">Quality issues</h2>{!issues.data?.length ? <p className="mt-4 text-sm text-muted">No quality issues found.</p> : <div className="mt-4 space-y-3">{issues.data.slice(0, 8).map((issue) => <div className="rounded-xl bg-white/[0.03] p-3" key={issue.id}><div className="flex justify-between gap-3"><span className="text-sm font-semibold text-white">{issue.targetType}</span><span className="text-xs text-gold">{issue.status}</span></div><p className="mt-1 text-xs text-muted">{issue.description}</p></div>)}</div>}</Card><Card className="p-5"><h2 className="font-bold">Content reports</h2>{!reports.data?.length ? <p className="mt-4 text-sm text-muted">No reports found.</p> : <div className="mt-4 space-y-3">{reports.data.slice(0, 8).map((report) => <div className="rounded-xl bg-white/[0.03] p-3" key={report.id}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-white">{report.targetType}</span><select value={report.status} onChange={(event) => updateReport.mutate({ reportId: report.id, status: event.target.value as "OPEN" | "IN_REVIEW" | "RESOLVED" })} className="rounded-lg border border-line bg-panel px-2 py-1 text-xs text-white"><option>OPEN</option><option>IN_REVIEW</option><option>RESOLVED</option></select></div><p className="mt-1 text-xs text-muted">{report.reason}: {report.description ?? "No description."}</p></div>)}</div>}</Card></div><Card className="p-5"><h2 className="font-bold">Source registry</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{(sources.data ?? []).map((source) => <a href={source.url} target="_blank" rel="noreferrer" className="rounded-xl border border-line p-3 transition hover:border-gold" key={source.id}><p className="font-semibold text-white">{source.name}</p><p className="mt-1 text-xs text-muted">{source.sourceType} · {source.creditText}</p></a>)}</div></Card></div>;
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <Card className="p-5"><div className="flex items-center gap-2 text-gold">{icon}<span className="text-3xl font-black text-white">{value}</span></div><p className="mt-2 text-xs text-muted">{label}</p></Card>;
}
