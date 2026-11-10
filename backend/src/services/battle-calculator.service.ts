import { calculateTypeEffectiveness } from "./type-chart.service.js";
export type BattleInput = { gameId: string; level: number; attack: number; defense: number; power: number; moveType: string; defenderTypes: string[]; stab?: boolean; randomMin?: number; randomMax?: number };
export type BattleModifiers = {
  critical?: boolean;
  burned?: boolean;
  weather?: "sun" | "rain" | "none";
  screen?: "reflect" | "light_screen" | "none";
};
export const calculateDamage = (input: BattleInput) => {
  const effectiveness = calculateTypeEffectiveness(input.moveType, input.defenderTypes, input.gameId);
  return calculateDamageWithModifiers(input, {});
};

export const calculateDamageWithModifiers = (input: BattleInput, modifiers: BattleModifiers) => {
  const effectiveness = calculateTypeEffectiveness(input.moveType, input.defenderTypes, input.gameId);
  const critical = modifiers.critical === true;
  const burned = modifiers.burned === true && !critical;
  const weather = modifiers.weather ?? "none";
  const screen = modifiers.screen ?? "none";
  const weatherMultiplier = weather === "sun" && input.moveType === "fire" ? 1.5 : weather === "sun" && input.moveType === "water" ? 0.5 : weather === "rain" && input.moveType === "water" ? 1.5 : weather === "rain" && input.moveType === "fire" ? 0.5 : 1;
  const screenMultiplier = critical ? 1 : screen === "reflect" || screen === "light_screen" ? 0.5 : 1;
  const burnMultiplier = burned ? 0.5 : 1;
  const criticalMultiplier = critical ? 2 : 1;
  const base = Math.floor(Math.floor((Math.floor((2 * input.level) / 5 + 2) * input.power * (burned ? Math.floor(input.attack / 2) : input.attack)) / input.defense) / 50) + 2;
  const modifier = (input.stab === false ? 1 : 1.5) * effectiveness * weatherMultiplier * screenMultiplier * burnMultiplier * criticalMultiplier;
  const min = Math.max(1, Math.floor(base * modifier * (input.randomMin ?? 217 / 255)));
  const max = Math.max(min, Math.floor(base * modifier * (input.randomMax ?? 1)));
  return { min_damage: min, max_damage: max, type_effectiveness: effectiveness, modifiers: { critical, burned, weather, screen, stab: input.stab !== false, weather_multiplier: weatherMultiplier, screen_multiplier: screenMultiplier }, assumptions: ["Generation III physical/special classification is determined by move type.", "Random damage variance defaults to 217-255/255.", "Critical hits ignore burn, Reflect, and Light Screen modifiers.", "Weather applies only to Fire and Water damage in this calculator."] };
};
