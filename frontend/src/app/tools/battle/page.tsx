"use client";

import { Calculator, Info, Zap } from "lucide-react";
import { useState } from "react";
import { useBattleCalculate } from "@/hooks/use-game-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/query-state";
import { GAME_IDS, type GameId } from "@/types/api";

export default function BattleToolPage() {
  const calculate = useBattleCalculate();
  const [gameId, setGameId] = useState<GameId>("emerald");
  const [level, setLevel] = useState(50);
  const [attack, setAttack] = useState(100);
  const [defense, setDefense] = useState(100);
  const [power, setPower] = useState(80);
  const [moveType, setMoveType] = useState("fire");
  const [defenderTypes, setDefenderTypes] = useState("grass");
  const [stab, setStab] = useState(true);
  const [critical, setCritical] = useState(false);
  const [burned, setBurned] = useState(false);
  const [weather, setWeather] = useState<"sun" | "rain" | "none">("none");
  const [screen, setScreen] = useState<"reflect" | "light_screen" | "none">("none");
  const submit = (event: React.FormEvent) => { event.preventDefault(); calculate.mutate({ game_id: gameId, level, attack, defense, power, move_type: moveType, defender_types: defenderTypes.split(",").map((item) => item.trim()).filter(Boolean), stab, critical, burned, weather, screen }); };
  return <div className="space-y-8"><div><p className="eyebrow">Generation III ruleset</p><h1 className="page-title">Battle lab</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Estimate a damage range with the backend calculator. This is not a full battle simulator.</p></div><div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]"><Card className="p-6"><form className="space-y-5" onSubmit={submit}><div className="grid gap-3 sm:grid-cols-3"><Field label="Game"><select value={gameId} onChange={(event) => setGameId(event.target.value as GameId)}>{GAME_IDS.map((id) => <option key={id} value={id}>{id}</option>)}</select></Field><Field label="Level" value={level} onChange={setLevel} /><Field label="Move power" value={power} onChange={setPower} /></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Attack" value={attack} onChange={setAttack} /><Field label="Defense" value={defense} onChange={setDefense} /><Field label="Move type" value={moveType} onChange={setMoveType} /><Field label="Defender types" value={defenderTypes} onChange={setDefenderTypes} /></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Weather"><select value={weather} onChange={(event) => setWeather(event.target.value as typeof weather)}><option value="none">None</option><option value="sun">Sun</option><option value="rain">Rain</option></select></Field><Field label="Screen"><select value={screen} onChange={(event) => setScreen(event.target.value as typeof screen)}><option value="none">None</option><option value="reflect">Reflect</option><option value="light_screen">Light Screen</option></select></Field></div><div className="flex flex-wrap gap-4 text-sm text-muted">{[["STAB", stab, setStab], ["Critical", critical, setCritical], ["Burned", burned, setBurned]].map(([label, checked, setter]) => <label className="flex items-center gap-2" key={label as string}><input type="checkbox" checked={checked as boolean} onChange={(event) => (setter as (value: boolean) => void)(event.target.checked)} className="accent-gold" />{label as string}</label>)}</div>{calculate.isError && <ErrorState message={calculate.error.message} />}{calculate.data ? <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-sm text-gold"><p className="font-bold">Calculation complete</p><p className="mt-1 text-3xl font-black">{calculate.data.min_damage}–{calculate.data.max_damage} damage</p><p className="mt-2 text-xs">Effectiveness: {calculate.data.type_effectiveness}×</p></div> : <Button type="submit" disabled={calculate.isPending}><Calculator size={16} /> {calculate.isPending ? "Calculating..." : "Calculate damage"}</Button>}</form></Card><Card className="p-6"><div className="flex items-center gap-2"><Zap className="text-gold" size={19} /><h2 className="font-bold">How to read this</h2></div><div className="mt-5 space-y-4 text-sm leading-6 text-muted"><p><Info className="mr-2 inline text-gold" size={15} />Results include Generation III effectiveness, modifiers, and random variance.</p>{calculate.data?.assumptions.map((assumption) => <p className="border-l border-line pl-3" key={assumption}>{assumption}</p>)}</div></Card></div></div>;
}

function Field({ label, value, onChange, children }: { label: string; value?: string | number; onChange?: (value: never) => void; children?: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-muted"><span className="mb-2 block">{label}</span>{children ?? <input type={typeof value === "number" ? "number" : "text"} value={value} onChange={(event) => onChange?.((typeof value === "number" ? Number(event.target.value) : event.target.value) as never)} className="h-10 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-gold" />}</label>;
}
