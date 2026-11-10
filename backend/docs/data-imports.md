# Data imports

Use `npm run import:reference -- --source pokeapi --limit 25 --dry-run` to preview a bounded import, then omit `--dry-run` to write reference records. Imports are upsert-based, idempotent, provenance-aware, and never delete player progress or manual guide content. Records remain `needs_review` until validated. The importer supports Pokémon, species, stats, sprites, types, non-hidden abilities, Generation III move learnsets, evolution relationships, source records, and checksums.

Game-specific content must be imported or authored separately and reviewed before publication. The Phase 3 schema stores locations, route connections, item placements, shops, trainers, trainer parties, walkthrough prerequisites, battles, strategies, quests, flags, and checklist templates. No unverified game content is fabricated by the seed.

Run `npm run data:validate` after imports. Validation fails when fewer than 386 Generation III reference species/Pokémon exist, any canonical game has no locations or encounters, encounters reference missing records or invalid levels, source evidence is missing, or unresolved quality issues remain.

Use the source-backed manifest format in [game-data-format.md](./game-data-format.md). `import:game` is bounded, validates game ownership and foreign references, records an import run and checksums, and is safe to rerun. Dry-run mode performs no database writes.
