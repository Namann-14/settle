# services/ai/app/schemas/common.py

**Purpose:** Shared enums mirroring services/api's enums.

**Key contents:** `SplitType` (EQUAL, UNEQUAL, PERCENTAGE) and `SourceType` (RECEIPT_IMAGE, NL_TEXT, VOICE).

**Depends on / used by:** `schemas/draft.py`, `chains/extraction`, `routes/expenses.py`, `services/draft_builder.py`. Must stay in sync with `services/api/app/db/enums.py`.

**Decisions & caveats:** `SplitType` is a real Enum rather than `str` because llama-3.3-70b returned lowercase or invented values ("exact") with a plain string; an Enum puts the allowed values into the JSON schema sent to the model and Pydantic rejects the rest.
