# services/ai/app/tools/categories.py

**Purpose:** Chat tool listing the user's expense categories.

**Key contents:** `list_my_categories` returns one category name per line.

**Depends on / used by:** `services/context`, `core/errors`. Registered in `tools/__init__.py`.

**Decisions & caveats:** Errors other than 401 are returned as text so the model can respond; 401 propagates so the request fails properly.
