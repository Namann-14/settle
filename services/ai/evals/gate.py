"""Offline eval gate: fail when a suite's pass rate is below its threshold.

    uv run --group eval pytest --junitxml=eval-results.xml
    uv run --group eval python -m evals.gate eval-results.xml

pytest's own exit code fails on any single case, which is too strict for LLM
output; this turns per-case results into per-suite pass rates and compares them
with evals/thresholds.json. Writes a table to the GitHub job summary when run
in Actions.
"""

from __future__ import annotations

import json
import os
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

THRESHOLDS = json.loads((Path(__file__).parent / "thresholds.json").read_text(encoding="utf-8"))["offline"]


def suite_results(junit_path: str) -> tuple[Counter, Counter]:
    """(total, passed) per test module, e.g. "test_extraction"."""
    total: Counter[str] = Counter()
    passed: Counter[str] = Counter()
    for case in ET.parse(junit_path).getroot().iter("testcase"):
        suite = (case.get("classname") or "").split(".")[-1]
        if case.find("skipped") is not None:
            continue
        total[suite] += 1
        # a failure, an error (crash, missing key) or nothing at all (pass)
        if case.find("failure") is None and case.find("error") is None:
            passed[suite] += 1
    return total, passed


def main() -> int:
    junit_path = sys.argv[1] if len(sys.argv) > 1 else "eval-results.xml"
    if not Path(junit_path).exists():
        print(f"::error::{junit_path} not found; pytest didn't run")
        return 1
    total, passed = suite_results(junit_path)

    rows, ok = [], True
    for suite, threshold in THRESHOLDS.items():
        n = total[suite]
        rate = passed[suite] / n if n else 0.0
        suite_ok = n > 0 and rate >= threshold
        ok &= suite_ok
        rows.append(f"| {suite} | {passed[suite]}/{n} | {rate:.0%} | {threshold:.0%} | {'pass' if suite_ok else 'FAIL'} |")

    table = "\n".join(["| suite | passed | score | threshold | result |", "|---|---|---|---|---|", *rows])
    print(table)
    if summary := os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(summary, "a", encoding="utf-8") as f:
            f.write(f"## Eval gate\n\n{table}\n\nPer-case results are in LangSmith (settle-extraction, settle-tool-routing).\n")
    if not ok:
        print("::error::eval scores below threshold (thresholds in services/ai/evals/thresholds.json)")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
