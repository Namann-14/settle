# decisions.md

**Purpose:** Running log of product and architecture decisions for Settle with reasoning.

**Key contents:** Entries: personal expense tracker (spending is the user's share, default currency only, standing budgets, idempotent recurring sync with no cron, 12 seeded system categories, minimal incomes); dashboard performance without Redis (move Vercel region to sin1, fewer queries, pool tuning, request timing logs); faster first load (server prefetch, lighter landing page, deferred hero video).

**Depends on / used by:** Referenced by most docs here; code in `services/api`, `services/ai` and `apps/web`.

**Decisions & caveats:** Append new decisions with a date heading. Includes an irreversible migration (`5b1e0c7d9a21`, category merge) and a note to check the production `DATABASE_URL` points at the Singapore Neon DB.
