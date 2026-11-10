import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { importReferenceData } from "../src/integrations/pokeapi/importer.js";

const argv = process.argv.slice(2);
const source = argv[argv.indexOf("--source") + 1] ?? "pokeapi";
const limitValue = Number(argv[argv.indexOf("--limit") + 1] ?? 0);
const limit =
  Number.isInteger(limitValue) && limitValue > 0
    ? Math.min(limitValue, 386)
    : 0;
const startValue = Number(argv[argv.indexOf("--from") + 1] ?? 1);
const start =
  Number.isInteger(startValue) && startValue > 0
    ? Math.min(startValue, 386)
    : 1;
const dryRun = argv.includes("--dry-run");
const coreOnly = argv.includes("--core-only");
if (source !== "pokeapi") {
  console.error(
    `Unsupported reference source: ${source}. Supported sources: pokeapi.`,
  );
  process.exitCode = 1;
} else if (limit === 0) {
  console.error(
    "A bounded --limit is required for reference imports (1-386). Use --dry-run to preview.",
  );
  process.exitCode = 1;
} else {
  try {
    if (start > limit)
      throw new Error("--from must be less than or equal to --limit.");
    console.log(
      JSON.stringify(
        await importReferenceData({ limit, start, dryRun, coreOnly }),
      ),
    );
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Reference import failed.",
    );
    process.exitCode = 1;
  }
}
await prisma.$disconnect();
