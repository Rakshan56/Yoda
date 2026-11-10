import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("app-card rounded-2xl border border-line bg-panel/80 shadow-soft", className)} {...props} />;
}
