# apps/web/src/lib/people.ts

**Purpose:** Small helpers for names, dates and money values in the UI.

**Key contents:** `initials`, `firstName`, `buildNameMap(groups)`, `displayName(names, userId, meId)`, `num` (Decimal string to number), `todayIso` (local date), `formatDay`.

**Depends on / used by:** `types/group.ts`; used across expense/settlement lists.

**Decisions & caveats:** The API has no GET /users/{id}, so names are resolved from group member lists already fetched; non-group users show as 'Member'. `todayIso` uses local time deliberately, matching what recurring sync sends. Money arrives as Decimal strings.
