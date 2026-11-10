export const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const english = (entries: Array<{ language: { name: string }; name: string }>) =>
  entries.find((entry) => entry.language.name === "en")?.name ?? entries[0]?.name ?? "";
export const englishEffect = (entries: Array<{ language: { name: string }; effect: string }>) =>
  entries.find((entry) => entry.language.name === "en")?.effect ?? null;
export const englishShortEffect = (entries: Array<{ language: { name: string }; short_effect: string }>) =>
  entries.find((entry) => entry.language.name === "en")?.short_effect ?? null;
