"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Game, GameId } from "@/types/api";
import { gamePath } from "@/lib/game-routes";

export function GameSwitcher({ games, current }: { games: Game[]; current?: GameId }) {
  return <label className="relative inline-flex items-center"><span className="sr-only">Select game</span><select value={current ?? ""} onChange={(event) => { window.location.href = gamePath(event.target.value as GameId); }} className="h-10 appearance-none rounded-xl border border-line bg-panel px-4 pr-9 text-sm font-semibold text-white outline-none focus:border-gold"><option value="" disabled>Choose a game</option>{games.map((game) => <option key={game.id} value={game.id}>{game.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 text-muted" size={16} /></label>;
}

export function GameCrumb({ game }: { game: Game }) {
  return <Link href={gamePath(game.id)} className="text-sm font-semibold text-gold hover:text-white">{game.name}</Link>;
}
