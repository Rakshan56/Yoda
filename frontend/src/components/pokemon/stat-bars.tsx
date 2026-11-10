import type { Pokemon } from "@/types/api";

const stats: Array<[keyof NonNullable<Pokemon["stats"]>, string]> = [
  ["hp", "HP"], ["attack", "Attack"], ["defense", "Defense"], ["special_attack", "Sp. Atk"], ["special_defense", "Sp. Def"], ["speed", "Speed"]
];

export function StatBars({ value }: { value: Pokemon["stats"] }) {
  if (!value) return <p className="text-sm text-muted">Base stats are unavailable.</p>;
  return <div className="space-y-3">{stats.map(([key, label]) => { const stat = value[key]; return <div key={key}><div className="mb-1 flex justify-between text-xs"><span className="text-muted">{label}</span><span className="font-bold text-white">{stat}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, (stat / 180) * 100)}%` }} /></div></div>; })}</div>;
}
