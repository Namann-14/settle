"""Offline eval: expense extraction against hand-labelled cases.

Each case is one LangSmith example in the "settle-extraction" dataset; each
run is an experiment, so prompt or model changes can be compared side by side.
"""

from datetime import date

import pytest
from langsmith import testing as t

from app.chains.extraction import extract_from_text
from evals.cases import load_cases
from evals.scorers import sanity_checks, score_extraction

DATA = load_cases("extraction_cases.json")
CTX = DATA["context"]


@pytest.mark.langsmith(test_suite_name="settle-extraction")
@pytest.mark.parametrize("case", DATA["cases"], ids=lambda c: c["id"])
def test_extraction(case, arun):
    t.log_inputs({"text": case["text"], **CTX})
    t.log_reference_outputs(case["expected"])

    draft = arun(
        extract_from_text(
            text=case["text"],
            categories=[{"name": n} for n in CTX["categories"]],
            me_name=CTX["me_name"],
            default_currency=CTX["default_currency"],
            today=date.fromisoformat(CTX["today"]),
        )
    )
    output = draft.model_dump(mode="json")
    t.log_outputs(output)

    for key, (ok, _) in sanity_checks(output, ", ".join(CTX["categories"])).items():
        t.log_feedback(key=key, score=int(ok))
    results = score_extraction(output, case["expected"], CTX["me_name"])
    for key, ok in results.items():
        t.log_feedback(key=f"correct_{key}", score=int(ok))

    wrong = [k for k, ok in results.items() if not ok]
    assert not wrong, f"wrong fields {wrong}: {output}"
