# apps/web/src/hooks/useGroups.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useGroups` lists the user's groups, key `groups`.

**Depends on / used by:** `lib/api/groups.ts`; also feeds `buildNameMap` in `lib/people.ts`, since the API has no GET /users/{id}.

**Decisions & caveats:** The query key must match the same key in `src/lib/server-prefetch.tsx` (`serverQueries`), otherwise server-prefetched data is never used (see decisions.md, 'Faster first load').
