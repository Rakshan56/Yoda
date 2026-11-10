# Yoda frontend

The Yoda frontend is a Next.js App Router application for the Pokémon Generation
III guide. It is intentionally separate from the existing `backend/` workspace.

## Local development

```sh
cp .env.example .env.local
npm install
npm run dev
```

The browser uses the same-origin `/api/v1` proxy by default. The proxy forwards
to `BACKEND_API_URL`, which defaults to `http://localhost:8000/api/v1`. Set
`BACKEND_API_URL` in `.env.local` when the backend runs elsewhere. Use
`NEXT_PUBLIC_API_BASE_URL` only when the browser must call the backend directly.

## Verification

```sh
npm run typecheck
npm run build
```

The shared API client in `src/lib/api-client.ts` follows the backend's
`{ data }` success envelope, bearer access-token flow, refresh-cookie
credentials, and CSRF cookie/header convention.

## Application structure

- `src/app` contains thin Next.js route entrypoints and route parameters.
- `src/hooks` is split by domain (`games`, `pokemon`, `teams`, `user`,
  `helper`, `admin`, and `credits`); domain changes should stay in the matching
  module.
- `src/components/ui` and `src/components/shared` contain reusable visual
  primitives and loading/error states.
- `src/lib` contains infrastructure only, including API transport and utility
  functions.
- `src/stores` contains isolated client state such as UI navigation and local
  bookmarks.
- `src/features` documents the boundary for extracting route-specific feature
  components without coupling them to the application shell.

`src/hooks/use-game-content.ts` remains a compatibility barrel for existing
imports. New code should import from the specific domain module or from
`src/hooks/index.ts`.
