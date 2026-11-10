# Deployment

Run `npx prisma migrate deploy` as a controlled release step before starting web instances. Do not run migrations from every instance. Set a random production `JWT_ACCESS_SECRET`, a private PostgreSQL URL, `COOKIE_SECURE=true`, and an explicit `FRONTEND_ORIGINS` allowlist. The in-process limiter is suitable only for a single instance; use a reviewed shared store before horizontal scaling.
