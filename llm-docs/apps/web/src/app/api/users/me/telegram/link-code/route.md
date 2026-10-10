# apps/web/src/app/api/users/me/telegram/link-code/route.ts

**Purpose:** Next.js route handler that proxies the browser's request for a Telegram link code to the backend API.

**Key contents:** `POST` handler calling `backendFetch("/users/me/telegram/link-code")` and returning the JSON; errors go through `backendErrorResponse`.

**Depends on / used by:** Uses `@/lib/backend`. Called by the Telegram settings card (`components/settings/telegram-card`).

**Decisions & caveats:** Thin proxy so the browser never talks to the API directly (auth is attached server-side). Nothing else notable.
