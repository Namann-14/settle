# apps/web/src/app/api/users/me/telegram/route.ts

**Purpose:** Route handler that proxies unlinking the user's Telegram account.

**Key contents:** `DELETE` handler calling the backend `/users/me/telegram` and returning an empty 204.

**Depends on / used by:** Uses `@/lib/backend`. Called by the Telegram settings card.

**Decisions & caveats:** Returns 204 with no body rather than forwarding the backend response. Nothing else notable.
