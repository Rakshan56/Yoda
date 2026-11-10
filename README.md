# Yoda

## Pokémon GBA Guide

Yoda is a modern, source-backed companion application for Pokémon
Generation III adventures. It brings game guides, Pokédex data, locations,
battles, teams, progress tracking, and personal collections into one focused
experience.

![Yoda Pokémon GBA Guide](frontend/public/yoda-icon.png)

## Highlights

- Cinematic Pokémon-inspired interface with dark and light themes
- Game library for FireRed, LeafGreen, Ruby, Sapphire, and Emerald
- Game-specific walkthroughs, locations, battles, quests, and checklists
- Searchable Pokédex with game and type filtering
- Team Builder with six-slot teams and coverage analysis
- Collection and progress tracking
- Bookmarks and guide helper tools
- Authentication with access-token refresh and protected user data
- Responsive layout with drawer navigation and mobile-friendly controls
- PostgreSQL-backed content managed through Prisma

## Project structure

```text
yoda/
├── backend/       Express 5 API, Prisma schema, migrations, and data tools
├── frontend/      Next.js App Router application
├── .env           Local development environment configuration
└── README.md
```

## Technology

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma
- PostgreSQL
- JWT authentication
- Argon2 password hashing

## Requirements

- Node.js 20 or newer
- npm
- Docker Desktop
- PostgreSQL, normally provided through Docker Compose

## Local setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Copy the example files when needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

The local backend uses:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pokemon_guide?schema=public
```

The frontend uses the same-origin API proxy:

```env
NEXT_PUBLIC_API_BASE_URL=/api/v1
BACKEND_API_URL=http://localhost:8000/api/v1
```

Never commit real secrets or production environment files.

### 3. Start PostgreSQL

```bash
cd backend
docker compose up -d db
```

### 4. Prepare the database

```bash
cd backend
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

### 5. Start the backend

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:8000`.

### 6. Start the frontend

In another terminal:

```bash
cd frontend
npm run dev
```

The application runs at `http://localhost:3000`.

## Useful commands

### Frontend

```bash
npm run typecheck
npm run lint
npm run build
```

### Backend

```bash
npm run typecheck
npm run lint
npm test
npm run data:validate
```

## Test users

For local authentication testing, create the deterministic test users:

```bash
cd backend
npm run test:users
```

Use the instructions in [`backend/docs/test-users.md`](backend/docs/test-users.md)
for the available local personas.

## Content workflow

Guide content is intentionally served only after review and publication.
Content generally moves through:

```text
Draft → Needs review → Verified → Published
```

Content must have a source reference and no unresolved quality issues before
publication.

```bash
cd backend
npm run publish:content -- \
  --target-type WALKTHROUGH_CHAPTER \
  --target-id <chapter-id> \
  --reviewer admin
```

Supported content types include walkthrough chapters, battles, locations,
encounters, and quests.

## Main routes

| Route | Purpose |
|---|---|
| `/home` | Application home and game carousel |
| `/games` | Adventure library |
| `/games/pokemon-emerald` | Readable game guide route |
| `/pokedex` | Searchable Pokémon reference |
| `/teams` | Team Builder |
| `/collection` | Personal collection |
| `/tools/battle` | Battle calculation tools |
| `/profile` | User profile |

## API

The frontend calls the backend through the Next.js same-origin proxy:

```text
/api/v1
```

The backend API is available directly during local development at:

```text
http://localhost:8000/api/v1
```

## Contributing

1. Create a feature branch.
2. Make focused changes.
3. Run the relevant type checks, linting, and tests.
4. Update documentation for user-visible behavior.
5. Open a pull request with a clear summary and validation details.

## License

This project is intended for educational and personal use. Pokémon and
related trademarks belong to their respective owners.
