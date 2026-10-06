# apps/web/src/hooks/mutations/index.ts

**Purpose:** Barrel file for mutation hooks.

**Key contents:** Re-exports every mutation hook module (expense, group, settlement, category, members, draft, budget, income, recurring, Telegram).

**Depends on / used by:** Imported by components as `@/hooks/mutations`.

**Decisions & caveats:** New mutation hook files must be added here to be importable from the barrel.
