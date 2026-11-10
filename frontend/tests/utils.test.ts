import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting Tailwind classes", () => {
    expect(cn("rounded-lg bg-red-500", "rounded-xl bg-gold")).toBe("rounded-xl bg-gold");
  });

  it("omits false and null class values", () => {
    expect(cn("text-white", false, null, undefined)).toBe("text-white");
  });
});
