# Next.js integration

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`. Use JSON requests and send `Authorization: Bearer <access_token>` for authenticated calls. Login and registration set an HTTP-only `yoda_refresh_token` cookie and a readable `yoda_csrf_token` cookie; keep `credentials: "include"` and copy the CSRF cookie value to `x-csrf-token` for cookie-authenticated state-changing requests, including refresh. Refresh rotates and revokes the prior token. The backend allowlist defaults to `http://localhost:3000`; set `FRONTEND_ORIGINS` for other origins.
