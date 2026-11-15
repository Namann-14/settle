# services/ai/evals/gate.py

**Purpose:** Offline eval gate: turns per-case pytest results into per-suite pass rates and fails when one is below its threshold.

**Key contents:** `python -m evals.gate <junit.xml>` reads pytest's JUnit XML, groups test cases by module (`test_extraction`, `test_tool_routing`), compares pass rates with `thresholds.json["offline"]`, prints a markdown table (also written to the GitHub job summary) and exits 1 on any miss.

**Depends on / used by:** `evals/thresholds.json`, the JUnit output of `pytest --junitxml`. Run by the `Eval gate` job in `.github/workflows/ai-evals.yml`, which branch protection on `main` requires.

**Decisions & caveats:** pytest's own exit code is ignored in CI because one wrong LLM answer would fail the PR; the threshold decides instead. Errors (crash, missing key) count as failures, skipped cases don't count, and a suite with zero results fails, so a broken run can't pass the gate. Every suite listed in the thresholds must have results.
