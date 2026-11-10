import { describe, expect, it } from "vitest";
import { calculateDamage, calculateDamageWithModifiers } from "../../src/services/battle-calculator.service.js";
describe("Generation III battle calculator", () => {
  it("returns bounded damage and explicit assumptions", () => {
    const result = calculateDamage({ gameId: "emerald", level: 50, attack: 100, defense: 100, power: 80, moveType: "fire", defenderTypes: ["grass"], stab: true });
    expect(result.min_damage).toBeGreaterThan(0);
    expect(result.max_damage).toBeGreaterThanOrEqual(result.min_damage);
    expect(result.assumptions.length).toBeGreaterThan(0);
  });

  it("applies Gen III critical, burn, weather, and screen rules", () => {
    const normal = calculateDamage({ gameId: "emerald", level: 50, attack: 100, defense: 100, power: 80, moveType: "fire", defenderTypes: ["grass"], stab: true });
    const modified = calculateDamageWithModifiers({ gameId: "emerald", level: 50, attack: 100, defense: 100, power: 80, moveType: "fire", defenderTypes: ["grass"], stab: true }, { critical: true, burned: true, weather: "sun", screen: "reflect" });
    expect(modified.modifiers.critical).toBe(true);
    expect(modified.modifiers.burned).toBe(false);
    expect(modified.modifiers.screen_multiplier).toBe(1);
    expect(modified.max_damage).toBeGreaterThan(normal.max_damage);
  });
});
