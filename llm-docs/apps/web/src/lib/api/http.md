# apps/web/src/lib/api/http.ts

**Purpose:** Shared fetch plumbing for the newer API clients.

**Key contents:** `handleResponse` (parses `detail` from FastAPI or `message` from Next proxies, returns undefined on 204), `request(url, method, body)` JSON helper, `withQuery(path, params)` that skips empty values.

**Depends on / used by:** Used by budgets, incomes, recurring and spending clients. Older clients (expenses, groups, settlements, users, categories) still inline their own copy.

**Decisions & caveats:** `request` only sets Content-Type when a body is present. Consolidating the older clients onto this file would remove duplication.
