import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const openapi = JSON.parse(readFileSync("docs/openapi.json", "utf8")) as { paths: Record<string, unknown> };
describe("Phase 3 route contract", () => {
  it("publishes game-content routes", () => {
    for (const path of [
      "/api/v1/games/{gameId}/locations",
      "/api/v1/games/{gameId}/locations/{locationId}/encounters",
      "/api/v1/games/{gameId}/walkthrough",
      "/api/v1/games/{gameId}/battles",
      "/api/v1/games/{gameId}/quests",
      "/api/v1/games/{gameId}/checklist",
    ]) expect(openapi.paths).toHaveProperty(path);
  });
});
