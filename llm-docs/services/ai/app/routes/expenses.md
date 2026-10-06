# services/ai/app/routes/expenses.py

**Purpose:** HTTP routes under `/expenses` that turn user input (text, receipt image) into suggestions or draft expenses.

**Key contents:** `POST /expenses/categorize` (category suggestion grounded on the user's real categories), `POST /expenses/from-text` (natural-language sentence to `ExpenseDraft`), and `POST /expenses/from-receipt` (receipt image to draft). Helper `_map_suggestion` maps an LLM category guess to a real category id.

**Depends on / used by:** Uses chains (`categorize`, `extraction`), `llm/audio`, `llm/vision`, `services/context`, `services/draft_builder`, and `schemas/draft|categorize|common`. Mounted by the AI app's main router.

**Decisions & caveats:** These routes never create an expense; the frontend confirms the draft and POSTs it to services/api. `from-receipt` currently returns 501 because the Groq account has no vision-capable model; the text-to-draft half is built, so enabling it is configuration only (see `llm/vision.py`).
