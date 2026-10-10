# apps/web/src/hooks/useCategories.ts

**Purpose:** Query hook listing categories.

**Key contents:** `useCategories` with key `["categories"]`.

**Depends on / used by:** Uses `lib/api/categories`; used across spending and expense UI.

**Decisions & caveats:** Key must stay in sync with server prefetch keys (decisions.md, dashboard prefetch).
