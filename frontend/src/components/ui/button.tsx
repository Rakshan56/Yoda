import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "app-button inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-transparent px-4 text-sm font-semibold transition focus-visible:border-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 active:border-red-500 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-gold text-ink hover:bg-[#ffe27a]",
        variant === "secondary" && "border border-line bg-panel text-white hover:border-muted",
        variant === "ghost" && "text-muted hover:bg-white/5 hover:text-white",
        className
      )}
      {...props}
    />
  );
}
