import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const openapi = JSON.parse(readFileSync(resolve("docs/openapi.json"), "utf8")) as { paths: Record<string, unknown> };

describe("reference API contract", () => {
  it("publishes every Phase 2 reference route", () => {
    const paths = Object.keys(openapi.paths);
    for (const path of [
      "/api/v1/games",
      "/api/v1/pokemon",
      "/api/v1/pokemon/compare",
      "/api/v1/pokemon/{pokemonId}/evolutions",
      "/api/v1/moves",
      "/api/v1/abilities",
      "/api/v1/types",
      "/api/v1/types/chart",
      "/api/v1/items",
    ]) expect(paths).toContain(path);
  });
});
