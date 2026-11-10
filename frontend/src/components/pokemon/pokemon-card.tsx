import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Pokemon } from "@/types/api";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  fire: "bg-orange-400/15 text-orange-200",
  water: "bg-sky-400/15 text-sky-200",
  grass: "bg-emerald/15 text-emerald",
  electric: "bg-yellow-300/15 text-yellow-200",
  psychic: "bg-pink-400/15 text-pink-200",
  ice: "bg-cyan-300/15 text-cyan-200",
  dragon: "bg-indigo-400/15 text-indigo-200",
  dark: "bg-slate-400/15 text-slate-200",
  normal: "bg-stone-400/15 text-stone-200"
};

export function PokemonCard({ pokemon, selected, onSelect }: { pokemon: Pokemon; selected?: boolean; onSelect?: (pokemon: Pokemon) => void }) {
  const content = <Card className={cn("group h-full overflow-hidden p-4 transition hover:-translate-y-1 hover:border-gold", selected && "border-gold bg-gold/5")}>
    <div className="flex items-start justify-between"><span className="font-mono text-xs text-muted">#{String(pokemon.species.national_dex_number).padStart(3, "0")}</span>{onSelect ? <button type="button" onClick={(event) => { event.preventDefault(); onSelect(pokemon); }} className="rounded-lg border border-line px-2 py-1 text-[10px] font-bold text-gold">{selected ? "Selected" : "Compare"}</button> : <ArrowUpRight size={17} className="text-muted transition group-hover:text-gold" />}</div>
    <div className="grid h-36 place-items-center">{pokemon.sprites.front ? <img src={pokemon.sprites.front} alt={pokemon.name} className="h-32 w-32 object-contain [image-rendering:pixelated]" /> : <span className="text-4xl font-black text-white/10">?</span>}</div>
    <h2 className="font-bold capitalize text-white">{pokemon.name}</h2>
    <div className="mt-2 flex flex-wrap gap-1.5">{pokemon.types.map((type) => <span className={cn("rounded-full px-2 py-1 text-[10px] font-bold capitalize", typeColors[type.name] ?? "bg-white/10 text-muted")} key={type.slot}>{type.name}</span>)}</div>
  </Card>;
  return onSelect ? <div>{content}</div> : <Link href={`/pokemon/${pokemon.id}`}>{content}</Link>;
}
