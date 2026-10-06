# services/api/app/schemas/settlement.py

**Purpose:** Pydantic schemas for settlements.

**Key contents:** `SettlementCreate`, `SettlementUpdate`, `SettlementResponse`.

**Depends on / used by:** Used by `routes/settlements.py`, `repositories/settlement.py`.

**Decisions & caveats:** Update cannot change parties or group. Distinct payer/receiver is enforced by a DB check constraint.
