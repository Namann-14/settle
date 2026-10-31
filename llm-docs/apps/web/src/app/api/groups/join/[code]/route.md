# apps/web/src/app/api/groups/join/[code]/route.ts

**Purpose:** Next.js route handler that proxies join-link preview and join to the backend API.

**Key contents:** `GET /groups/join/{code}` (preview) and `POST` (join); the code is URL-encoded.

**Depends on / used by:** `backendFetch` in `src/lib/backend.ts` attaches the Clerk bearer token and forwards to `services/api`. Called by `useJoinPreview` / `useJoinGroup`.

**Decisions & caveats:** Static `join` segment sits beside `[id]`; Next prefers the static one, mirroring the api registering `/join/{code}` first. Errors go through `backendErrorResponse`, so an invalid code is a 404 with the api's message.
