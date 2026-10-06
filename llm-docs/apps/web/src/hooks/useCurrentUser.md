# apps/web/src/hooks/useCurrentUser.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useCurrentUser` fetches the signed-in user under key `currentUser`.

**Depends on / used by:** `lib/api/users.ts`, `types/user.ts`; used widely (default currency, Telegram link state).

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load').
