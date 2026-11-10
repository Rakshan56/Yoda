# Feature boundaries

Each feature owns its domain-specific UI, hooks, and types. A feature should
communicate with the rest of the application through:

- shared UI in `src/components/ui` and `src/components/shared`
- domain hooks in `src/hooks`
- the typed API client in `src/lib/api-client.ts`
- domain contracts in `src/types`

Keep route files in `src/app` as composition layers. They should select a
feature component and pass route parameters, rather than owning API details or
business logic. This makes a feature independently replaceable without
changing the application shell or other domains.
