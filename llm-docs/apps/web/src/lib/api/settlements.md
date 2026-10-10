# apps/web/src/lib/api/settlements.ts

**Purpose:** Client for `/api/settlements`.

**Key contents:** `listSettlements` (group_id, skip, limit), `createSettlement`, `updateSettlement`, `deleteSettlement`.

**Depends on / used by:** `types/settlement.ts`; `hooks/useSettlements.ts`.

**Decisions & caveats:** Has its own copy of `handleResponse`.
