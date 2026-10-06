# services/api/app/routes/categories.py

**Purpose:** HTTP routes for categories.

**Key contents:** `POST/GET /categories`, `GET/PATCH/DELETE /categories/{id}`.

**Depends on / used by:** Delegates to `controllers/category.py`; schemas in `schemas/category.py`.

**Decisions & caveats:** System categories cannot be modified or deleted; enforced in the controller, only documented here.
