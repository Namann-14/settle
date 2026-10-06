# apps/web/src/lib/api/index.ts

**Purpose:** Barrel for the API client modules and shared types.

**Key contents:** Re-exports `@/types` and the users, expenses, groups, settlements, categories, budgets, incomes, recurring and spending clients.

**Depends on / used by:** Importers can use `@/lib/api`.

**Decisions & caveats:** `ai.ts`, `chat.ts` and `http.ts` are deliberately not re-exported; import them by path. Re-exporting types here means name clashes would surface as barrel errors.
