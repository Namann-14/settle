# services/api/app/repositories/category.py

**Purpose:** Data access for categories.

**Key contents:** Get by id, list for user (system plus own, system first then by name), create, update (only set fields), delete.

**Depends on / used by:** Uses `models/category.py`, `schemas/category.py`; called from `controllers/category.py`.

**Decisions & caveats:** Authorization (system categories immutable) is not enforced here but in the controller. Deleting a category cascades to its budgets.
