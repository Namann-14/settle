# services/api/app/dependencies/auth.py

**Purpose:** FastAPI dependency that authenticates the request with Clerk.

**Key contents:** `get_current_user` calls `authenticate_request_async` with the Clerk secret key and returns `{user_id, session_id}` from the token claims; 401 if unauthenticated, 500 if the Clerk call itself errors.

**Depends on / used by:** `core/config` (secret key). Used by route modules, which then map the Clerk id to a local `User`. services/ai forwards user tokens here rather than verifying them itself.

**Decisions & caveats:** Returns the Clerk identity only, not the DB user. Clerk SDK failures are logged and surfaced as 500, distinct from a bad token.
