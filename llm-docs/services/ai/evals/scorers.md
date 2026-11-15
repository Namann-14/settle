# services/ai/evals/scorers.py

**Purpose:** Code scorers for expense extraction, shared by the offline tests and the live scorer.

**Key contents:** `score_extraction(output, expected, me_name)` compares against a labelled case (amount, currency, date, category list, split_type, payer_is_me, other participants, needs_note, max_confidence), checking only the keys the case sets. `sanity_checks(output, categories)` is reference-free (amount > 0 or null with a note, ISO currency and date, category from the offered list, valid split_type) and returns key -> (passed, comment). `other_participants` drops the speaker however written.

**Depends on / used by:** `app.schemas.common.SplitType`. Used by `test_extraction.py` and `online.py`.

**Decisions & caveats:** Works on plain dicts because LangSmith stores outputs with unset fields dropped, not null, so missing keys are read as their defaults. `split_type` may arrive as an Enum or a string; both are handled. `category` in a case is a list so honestly ambiguous inputs (gym: Health or Subscriptions) don't produce false failures.
