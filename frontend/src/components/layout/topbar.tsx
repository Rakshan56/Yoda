"use client";

import Link from "next/link";
import { Bell, Moon, Search, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";

export function Topbar() {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <header className="app-topbar flex h-[92px] items-center gap-4 border-b border-line px-5 lg:px-12">
      <Link href="/pokedex" className="relative w-full max-w-[666px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
        <input aria-label="Search the Pokédex" readOnly placeholder="Search Pokémon, locations, moves..." className="app-input h-12 w-full cursor-pointer rounded-xl border border-line bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none placeholder:text-muted focus:border-gold" />
      </Link>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Link href="/bookmarks" aria-label="Open bookmarks" className="rounded-xl p-2 text-muted transition hover:bg-white/5 hover:text-white"><Bell size={20} /></Link>
        <button aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} onClick={toggleTheme} className="rounded-xl p-2 text-muted transition hover:bg-white/5 hover:text-white">{theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}</button>
        <Link href="/profile" aria-label="Open profile" className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold to-orange-400 text-base font-black text-ink transition hover:scale-105">A</Link>
      </div>
    </header>
  );
}
