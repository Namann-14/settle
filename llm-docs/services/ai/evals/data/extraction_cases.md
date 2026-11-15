# services/ai/evals/data/extraction_cases.json

**Purpose:** Hand-labelled extraction cases (the `settle-extraction` LangSmith dataset).

**Key contents:** A shared `context` (speaker Asha, INR, today 2026-10-20, which is a Tuesday, and the 12 system categories) and 22 `cases`, each with `text` and `expected` fields. They cover equal, unequal and percentage splits, someone else paying, relative and explicit dates, foreign currency, a missing amount, Hinglish, voice-transcript filler, and a non-expense.

**Depends on / used by:** `test_extraction.py` via `evals.cases.load_cases`; field semantics in `evals/scorers.py`.

**Decisions & caveats:** Only fields a case can pin down are labelled (no `date` when the text gives none). `category` is a list of acceptable names. Adding a case also adds a LangSmith example on the next run. Add real failures from live scoring here.
