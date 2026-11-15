# services/ai/evals/test_extraction.py

**Purpose:** Offline eval of expense extraction against labelled cases.

**Key contents:** One parametrized test per case in `data/extraction_cases.json`, marked `@pytest.mark.langsmith(test_suite_name="settle-extraction")`. Logs inputs, reference outputs, outputs, sanity-check feedback and `correct_<field>` feedback; asserts every labelled field is right.

**Depends on / used by:** `app.chains.extraction.extract_from_text`, `evals.cases`, `evals.scorers`, the `arun` fixture.

**Decisions & caveats:** Calls the real model (one Groq call per case, two on a retry). A test passes only if the whole case is right, so the pass rate is case accuracy; per-field feedback shows which field broke. LLM output varies, so an occasional single failure is noise; compare experiments in LangSmith rather than chasing one red test. `today` is fixed in the case file so relative dates are checkable.
