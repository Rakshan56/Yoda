import { AlertCircle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Loading guide data..." }: { label?: string }) {
  return <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-muted"><LoaderCircle className="animate-spin text-gold" size={22} /><span>{label}</span></div>;
}

export function ErrorState({ message = "We couldn't load this guide data.", onRetry }: { message?: string; onRetry?: () => void }) {
  return <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center"><AlertCircle className="text-red-300" size={22} /><p className="text-sm text-red-100">{message}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-line p-10 text-center"><p className="font-semibold text-white">{title}</p><p className="mt-2 text-sm text-muted">{description}</p></div>;
}
