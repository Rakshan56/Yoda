# Guide for frontend integration

This guide explains how to connect a frontend application to the Yoda backend.

## 1. Start the backend

```sh
cd backend
cp .env.example .env
npm ci
docker compose up -d db
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

The backend runs at `http://localhost:8000`.

The API base URL is:

```text
http://localhost:8000/api/v1
```

For a Next.js frontend, set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

The backend allowlist defaults to `http://localhost:3000`. Add other frontend origins to `FRONTEND_ORIGINS` as a comma-separated list.

## 2. Response and error format

Successful responses use:

```json
{ "data": {} }
```

Paginated responses use:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 24,
    "total": 386,
    "total_pages": 17
  }
}
```

Errors use:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [],
    "request_id": "..."
  }
}
```

Use `error.request_id` when reporting a failed request to support staff.

## 3. Shared API client

Create one client instead of calling `fetch` directly throughout the frontend:

```ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = options.method?.toUpperCase() ?? "GET";
  const headers = new Headers(options.headers);
  headers.set("accept", "application/json");
  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const csrf = readCookie("yoda_csrf_token");
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrf) {
    headers.set("x-csrf-token", decodeURIComponent(csrf));
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const payload = (await response.json()) as { data?: T; error?: { code: string; message: string; details?: unknown[]; request_id?: string } };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Request failed with status ${response.status}`);
  }
  return payload.data as T;
}
```

Use this client only in browser/client code when reading the CSRF cookie. Server-side requests should use an access token explicitly.

## 4. Authentication flow

### Register or login

```ts
const result = await apiFetch<{
  user: { id: string; email: string; display_name: string; role: "USER" | "ADMIN" };
  access_token: string;
  expires_in: string;
}>("/auth/login", {
  method: "POST",
  body: JSON.stringify({
    email,
    password,
  }),
});

localStorage.setItem("yoda_access_token", result.access_token);
```

The refresh token is not returned in JSON. The backend sets an HTTP-only `yoda_refresh_token` cookie and a readable `yoda_csrf_token` cookie.

Send the access token on authenticated requests:

```ts
headers.set("authorization", `Bearer ${accessToken}`);
```

When the access token expires, call:

```ts
await apiFetch("/auth/refresh", { method: "POST" });
```

Refresh-token rotation requires `credentials: "include"` and the CSRF header. On logout:

```ts
await apiFetch("/auth/logout", { method: "POST" });
localStorage.removeItem("yoda_access_token");
```

Never store the refresh token in localStorage, sessionStorage, or frontend state.

## 5. Main public routes

```text
GET /health/live
GET /health/ready

GET /games
GET /games/:gameId
GET /pokemon
GET /pokemon/:id
GET /pokemon/compare
GET /pokemon/:id/evolutions
GET /pokemon/:id/moves
GET /moves
GET /moves/:id
GET /abilities
GET /abilities/:id
GET /items
GET /items/:id
GET /types
GET /types/chart
```

Valid game IDs are:

```text
firered
leafgreen
ruby
sapphire
emerald
```

Most list endpoints accept `page`, `page_size`, and sometimes `search`.

## 6. Game guide routes

All game guide routes use `/games/:gameId`:

```text
GET /games/:gameId/locations
GET /games/:gameId/locations/:locationId
GET /games/:gameId/locations/:locationId/connections
GET /games/:gameId/locations/:locationId/items
GET /games/:gameId/locations/:locationId/encounters
GET /games/:gameId/locations/:locationId/trainers
GET /games/:gameId/encounters
GET /games/:gameId/walkthrough
GET /games/:gameId/walkthrough/chapters
GET /games/:gameId/walkthrough/chapters/:chapterId
GET /games/:gameId/walkthrough/chapters/:chapterId/steps
GET /games/:gameId/battles
GET /games/:gameId/battles/:battleId
GET /games/:gameId/battles/:battleId/trainers
GET /games/:gameId/battles/:battleId/strategy
GET /games/:gameId/quests
GET /games/:gameId/quests/:questId
GET /games/:gameId/checklists
GET /games/:gameId/helper/search?q=...
```

Only content with `PUBLISHED` status is returned by public guide routes. The validated dataset currently contains five games, 386 species, 522 locations, and 7,485 encounters.

## 7. User features

These routes require a bearer access token:

```text
GET  /user/progress
PUT  /user/progress/:gameId
GET  /user/:gameId/collection
PUT  /user/:gameId/collection/:pokemonId
GET  /user/teams
POST /user/teams
DELETE /user/teams/:teamId
POST /user/teams/:teamId/members
GET  /helper/conversations
POST /helper/conversations
POST /helper/conversations/:conversationId/messages
```

State-changing requests must include the CSRF header described above.

## 8. Battle tools

```text
POST /tools/battle/calculate
POST /tools/battle/effectiveness
POST /tools/battle/move-comparison
POST /tools/battle/team-analysis
```

Example:

```ts
await apiFetch("/tools/battle/calculate", {
  method: "POST",
  body: JSON.stringify({
    game_id: "emerald",
    level: 50,
    attack: 100,
    defense: 100,
    power: 80,
    move_type: "fire",
    defender_types: ["grass"],
    stab: true,
    critical: false,
    burned: false,
    weather: "none",
    screen: "none",
  }),
});
```

The calculator is a Generation III ruleset tool with explicit assumptions. It should not be presented as a full battle simulator.

## 9. Credits and reports

Public source credits:

```text
GET /credits
GET /credits/:gameId/credits
```

Users or guests can report content:

```ts
await apiFetch("/content-reports", {
  method: "POST",
  body: JSON.stringify({
    target_type: "LOCATION",
    target_id: locationId,
    reason: "Incorrect connection",
    description: "The displayed route connection needs review.",
  }),
});
```

## 10. Admin frontend

Admin-only routes require an access token whose role is `ADMIN`:

```text
GET/PATCH /admin/quality-issues
GET/PATCH /admin/reports
GET/POST/PATCH /admin/sources
POST /admin/publish
POST /admin/unpublish
```

The frontend should hide admin navigation for normal users, but the backend remains the authority and returns `403 FORBIDDEN` for unauthorized users.

## 11. Recommended frontend structure

```text
src/
  lib/api-client.ts
  lib/auth-store.ts
  types/api.ts
  hooks/use-games.ts
  hooks/use-pokemon.ts
  hooks/use-game-content.ts
  hooks/use-progress.ts
  hooks/use-collection.ts
  hooks/use-teams.ts
  app/
```

Keep API DTOs separate from UI models. Put the selected game ID in route state or a shared game context, and include it in every game-specific request.

## 12. API discovery and verification

The live API contract is available at:

```text
http://localhost:8000/openapi.json
http://localhost:8000/docs
```

Before frontend integration:

```sh
npm run typecheck
npm run lint
npm test
npm run data:validate
```

Do not treat a successful HTTP response as proof that content is published; public guide routes intentionally hide `NEEDS_REVIEW`, `VERIFIED`, and draft records.
