import { describe, expect, it } from "vitest";
import { calculateTypeEffectiveness, analyzeTeamTypes } from "../../src/services/type-chart.service.js";
describe("Generation III type chart", () => {
  it("calculates dual type multipliers and immunities", () => {
    expect(calculateTypeEffectiveness("fire", ["grass", "bug"], "emerald")).toBe(4);
    expect(calculateTypeEffectiveness("normal", ["ghost"], "emerald")).toBe(0);
  });
  it("reports team weaknesses and resistances", () => {
    const result = analyzeTeamTypes([{ types: ["water"] }, { types: ["grass"] }], "firered");
    expect(result.member_count).toBe(2);
    expect(result.weaknesses.fire).toBe(1);
  });
});
