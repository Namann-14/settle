# services/api/app/routes/settlements.py

**Purpose:** HTTP routes for settlements.

**Key contents:** `POST/GET /settlements` (optional group filter), `GET/PATCH/DELETE /settlements/{id}`.

**Depends on / used by:** Delegates to `controllers/settlement.py`; schemas in `schemas/settlement.py`.

**Decisions & caveats:** Update and delete are allowed for creator or payer.
