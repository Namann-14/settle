# services/ai/app/routes/deps.py

**Purpose:** FastAPI dependency that pulls the bearer token out of the Authorization header for the AI service routes.

**Key contents:** `require_bearer_token` and the `BearerToken` annotated alias used as a route parameter type. Returns 401 on a missing, malformed, or empty header.

**Depends on / used by:** Used by every user-facing route module (expenses, insights, settlements). The token is then passed to `services/context.py`.

**Decisions & caveats:** The token is deliberately NOT verified here. services/ai has no Clerk secret; the first call to services/api (`/users/me` in `build_request_context`) validates it. This check only fails fast on obviously absent tokens.
