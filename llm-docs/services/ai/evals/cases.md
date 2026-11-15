# services/ai/evals/cases.py

**Purpose:** Loads a hand-labelled case file from `evals/data/`.

**Key contents:** `load_cases(name)` returns the JSON dict (`context` + `cases`).

**Depends on / used by:** Used by `test_extraction.py` and `test_tool_routing.py`.

**Decisions & caveats:** Lives outside `conftest.py` because importing from a conftest module is fragile in pytest.
