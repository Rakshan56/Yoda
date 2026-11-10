# API contract

Responses use `{ "data": ... }`; paginated responses add `meta` with `page`, `page_size`, `total`, and `total_pages`. Errors use `error.code`, `error.message`, `error.details`, and `error.request_id`. Public JSON uses snake_case where a mapper is present. Game IDs are `firered`, `leafgreen`, `ruby`, `sapphire`, and `emerald`.

Implemented public routes include health, games, Pokémon detail/list/compare/evolutions/moves/encounters, moves, abilities, items, types, the type chart, auth registration/login/refresh/me/logout, and battle calculation/effectiveness tools. Refresh tokens are never returned in JSON; they are rotated through an HTTP-only cookie. Run `npm run openapi:export` to regenerate the published route inventory.

Game-specific content routes are available under `/api/v1/games/:gameId` for locations, connections, items, encounters, trainers, walkthrough chapters and steps, battles and strategies, quests, and checklists. Public guide content is filtered to `PUBLISHED`; incomplete records remain unavailable rather than being presented as verified.
