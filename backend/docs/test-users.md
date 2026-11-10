# Local test users

The test-user template creates four deterministic local accounts for exercising
the frontend without using personal email addresses. They use the reserved
`example.test` domain and are intended only for local or isolated test
databases.

## Create the users

From the repository root:

```sh
cd backend
cp .env.example .env
npm ci
docker compose up -d db
npm run db:migrate:deploy
npm run db:seed
npm run test:users
npm run dev
```

The script is idempotent. Running it again resets the four test passwords,
display names, roles, and active status, but does not delete their progress,
teams, collection, or helper conversations.

The template is [data/test-users.template.json](../data/test-users.template.json).
Change it only for an isolated local database, keep passwords at least 12
characters, and do not use these credentials in a deployed environment.

## Test-user personas

| Persona | Email | Role | Primary checks |
|---|---|---|---|
| New Trainer | `new.trainer@example.test` | `USER` | Registration/login, empty states, guest browsing |
| Progress Trainer | `progress.trainer@example.test` | `USER` | Collection, progress, teams, checklist |
| Helper Trainer | `helper.trainer@example.test` | `USER` | Helper conversations, profile, bookmarks |
| Admin Reviewer | `admin.reviewer@example.test` | `ADMIN` | Admin authorization, reports, quality issues, sources |

Passwords are stored in the template file and are printed by neither the
script nor the application. Use the values in that file when signing in.

## End-to-end frontend checks

Start the frontend in a second terminal:

```sh
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`.

### New Trainer

1. Browse `/games`, `/pokedex`, and `/credits` while signed out.
2. Sign in at `/login` with the New Trainer credentials.
3. Confirm `/profile` shows the account.
4. Sign out and verify the session is cleared.

### Progress Trainer

1. Sign in with the Progress Trainer credentials.
2. Open `/games/emerald` and mark the game complete.
3. Open `/collection` and mark a Pokémon as caught.
4. Create a team at `/teams` and add a Pokémon to a slot.
5. Open `/games/emerald/checklist` and verify checklist interactions.
6. Refresh the browser and verify backend-backed progress, collection, and team data remain.

Checklist ticks are currently browser-session state because the backend exposes
the checklist template but no checklist mutation endpoint.

### Helper Trainer

1. Sign in with the Helper Trainer credentials.
2. Open `/helper`, select `emerald`, and send a suggested question.
3. Refresh and verify the conversation history is returned by the backend.
4. Open `/bookmarks` and verify browser-persisted bookmarks.
5. Open `/profile` and sign out.

The current backend stores helper user messages. It does not generate assistant
answers until an LLM provider is configured.

### Admin Reviewer

1. Sign in with the Admin Reviewer credentials.
2. Open `/admin`.
3. Verify quality issues, reports, and sources load.
4. Change a report status and confirm the request succeeds.
5. Sign out, sign in as a regular user, and verify `/admin` shows the forbidden state.

The frontend role check is only a UX guard; the backend `ADMIN` middleware is
the security authority.

## Direct API smoke checks

After signing in, use the access token returned by login:

```sh
curl -i http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -i http://localhost:8000/api/v1/user/progress \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

For mutations, preserve the `yoda_csrf_token` cookie and send its decoded
value in `x-csrf-token`. The frontend API client handles this automatically.
