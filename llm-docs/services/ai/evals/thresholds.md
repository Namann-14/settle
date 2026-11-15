# services/ai/evals/thresholds.json

**Purpose:** Pass/alert thresholds for the offline gate and the live monitor, in one place.

**Key contents:**

- `offline`: minimum pass rate per suite (`test_extraction`, `test_tool_routing`), used by `gate.py`.
- `online`: thresholds used by `online.py`:
  - `min_samples`: rates over fewer new runs are ignored.
  - `max_error_rate`: for `turn_succeeded` and `extraction_succeeded`.
  - `min_check_pass_rate`: for code checks.
  - `min_judge_pass_rate`: for `grounded` and `answers_question`.

**Depends on / used by:** `evals/gate.py`, `evals/online.py`.

**Decisions & caveats:** Set low (50%) on 2026-10-31 because the product is in development with no real users; raise them (e.g. 90% offline, 5% max error rate, 80% judge) before launch. The PR label `skip-evals` and the ruleset's admin bypass are the force-merge escape hatches, so thresholds don't have to be loosened just to ship one change.
