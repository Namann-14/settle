# services/api/app/services/clerk.py

**Purpose:** Clerk backend client and profile lookup.

**Key contents:** Module-level `clerk_client`, async `get_clerk_user`, and `fetch_clerk_profile` returning the primary email and display name.

**Depends on / used by:** Used by `routes/__init__.py`; configured by `core/config.py`.

**Decisions & caveats:** Instantiating the client at import time requires `CLERK_SECRET_KEY`. `fetch_clerk_profile` swallows all exceptions and returns (None, None) so a Clerk outage doesn't block sign-in.
