# services/ai/app/schemas/categorize.py

**Purpose:** Pydantic request/response models for category suggestion.

**Key contents:** `CategorizeRequest` (description, optional amount and merchant), `CategorySuggestion` (category_id, name, confidence 0-1, reasoning), `CategorizeResponse` (suggestion plus alternatives list).

**Depends on / used by:** `routes/expenses.py`, `schemas/draft.py`, `services/draft_builder.py`.

**Decisions & caveats:** `category_id` is null when the LLM's name matched no real category, so the frontend can ask the user rather than trusting an invented category. `alternatives` is defined but not currently populated by the route.
