# Verified game-data import format

The game importer accepts a source-backed JSON manifest. It is intentionally limited to locations, connections, and encounters until the corresponding game records have been reviewed.

```sh
npm run import:game -- --input data/emerald.json --dry-run
npm run import:game -- --input data/emerald.json
```

Each manifest must identify exactly one canonical game and one source. Records begin as `NEEDS_REVIEW`; the importer never marks content as verified or published.

Templates for all supported Generation III games are available:

- [emerald.template.json](../data/emerald.template.json)
- [firered.template.json](../data/firered.template.json)
- [leafgreen.template.json](../data/leafgreen.template.json)
- [ruby.template.json](../data/ruby.template.json)
- [sapphire.template.json](../data/sapphire.template.json)

Replace the source metadata only after reviewing the actual source and license.

Before import, compare the manifest against an independently reviewed source. After import, run `npm run data:validate`, record quality issues, and only then promote records through `VERIFIED` to `PUBLISHED`.

Publication is explicit and source-gated:

```sh
npm run publish:content -- --target-type LOCATION --target-id <id> --reviewer <reviewer-id>
```

The command refuses targets without a source reference or with unresolved quality issues. It supports `LOCATION`, `ENCOUNTER`, `WALKTHROUGH_CHAPTER`, `BATTLE`, and `QUEST`.
