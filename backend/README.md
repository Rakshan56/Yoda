# Yoda backend

Independent educational Pokémon Generation III guide API. This project is not affiliated with Nintendo, The Pokémon Company, or Game Freak.

## Local setup

```sh
cp .env.example .env
npm ci
docker compose up -d db
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The API is available at `http://localhost:8000`, with versioned application routes under `/api/v1`. Liveness is `/health/live`; readiness is `/health/ready`.

Frontend integration is documented in [docs/guide-to-frontend.md](./docs/guide-to-frontend.md).
Local authentication personas and the complete frontend test process are documented in [docs/test-users.md](./docs/test-users.md).

Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run openapi:export` before integration. `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1` is the frontend base URL.

## Current scope

The foundation includes PostgreSQL/Prisma schema and idempotent game/type seeds, health checks, CORS and request security middleware, standard error envelopes, public game/Pokédex/move/ability/item/type APIs, authentication primitives, bounded PokeAPI reference imports, and tested Generation III type/damage services. Game guides, encounter imports, teams, progress, admin review, and helper retrieval require verified source data and remain intentionally deferred rather than represented by fabricated responses.

Phase 3 game-content routes and relational models are implemented. Apply migrations before using them:

```sh
npm run db:migrate:deploy
npm run db:seed
npm run data:validate
```

Dataset validation is an acceptance gate, not only a schema check. It verifies Generation III reference coverage, per-game locations and encounters, encounter relationships and levels, source evidence, and unresolved quality issues. It exits with status `1` until the imported data satisfies those requirements.

For source-backed game data, copy the appropriate template from `data/` to a reviewed manifest, then run `npm run import:game -- --input data/<game>.json --dry-run`. Import and review before using `npm run publish:content`. The evidence workflow is documented in [docs/game-data-format.md](./docs/game-data-format.md).

## Phase 4 APIs

Authenticated user data is available under `/api/v1/user`:

- `GET /progress` and `PUT /progress/:gameId`
- `GET /:gameId/collection` and `PUT /:gameId/collection/:pokemonId`
- `GET/POST /teams`, `DELETE /teams/:teamId`, and `POST /teams/:teamId/members`

Admin users can review and publish content under `/api/v1/admin`:

- `GET /quality-issues`
- `PATCH /quality-issues/:issueId`
- `POST /publish`
- `POST /unpublish`
- `GET/POST/PATCH /sources`
- `GET/PATCH /reports`

Public attribution endpoints:

- `GET /api/v1/credits`
- `GET /api/v1/credits/:gameId/credits`
- `POST /api/v1/content-reports`

User mutations require the existing authentication and CSRF protections. Admin mutations also create audit-log records.

## Phase 5 battle and helper tools

- `POST /api/v1/tools/battle/calculate` supports STAB, critical hits, burn, weather, Reflect, Light Screen, and Generation III random variance. Pass `move_id` to validate type/power against a stored Generation III move.
- `POST /api/v1/tools/battle/effectiveness` calculates dual-type effectiveness.
- `POST /api/v1/tools/battle/move-comparison` compares Generation III moves and reports game availability.
- `POST /api/v1/tools/battle/team-analysis` analyzes weaknesses and resistances for up to six Pokémon.
- `GET /api/v1/games/:gameId/helper/search` searches only published, source-backed content.
- `/api/v1/helper/conversations` stores authenticated helper conversation messages. An LLM provider is intentionally unconfigured until a provider and privacy policy are selected.

## Data and attribution

Reference imports must preserve source URLs, retrieval dates, checksums, and review status. Do not publish incomplete or unverified game content as fact. Candidate sources are not claimed as used until an import run records them.
