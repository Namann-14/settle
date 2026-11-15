"""Code scorers shared by the offline tests and the live scorer.

Pure functions over plain dicts, so they work the same on a fresh
ExtractedExpense.model_dump() and on a run's outputs read back from LangSmith
(where unset fields are dropped rather than stored as null).
"""

from __future__ import annotations

import re
from datetime import date

from app.schemas.common import SplitType

SELF_MARKERS = {"me", "i", "myself"}
CURRENCY_RE = re.compile(r"^[A-Z]{3}$")


def other_participants(participants: list[dict], me_name: str | None) -> set[str]:
    """Lowercased participant names minus the speaker, however they were written."""
    self_names = SELF_MARKERS | ({me_name.strip().lower()} if me_name else set())
    names = {(p.get("raw_name") or "").strip().lower() for p in participants}
    return names - self_names - {""}


def _amount_matches(got, expected) -> bool:
    if expected is None:
        return got is None
    return got is not None and abs(float(got) - float(expected)) < 0.01


def score_extraction(output: dict, expected: dict, me_name: str | None) -> dict[str, bool]:
    """Field-by-field correctness against a hand-labelled case.

    Only fields present in `expected` are checked, so a case can say nothing
    about a field it can't pin down (e.g. date when the text gives none).
    `category` is a list of acceptable names, for honestly ambiguous inputs.
    """
    results: dict[str, bool] = {}
    if "amount" in expected:
        results["amount"] = _amount_matches(output.get("amount"), expected["amount"])
    if "currency" in expected:
        results["currency"] = output.get("currency") == expected["currency"]
    if "date" in expected:
        results["date"] = output.get("date") == expected["date"]
    if "category" in expected:
        allowed = {c.lower() for c in expected["category"]}
        results["category"] = (output.get("category_name") or "").lower() in allowed
    if "split_type" in expected:
        split = output.get("split_type", SplitType.EQUAL)
        results["split_type"] = getattr(split, "value", split) == expected["split_type"]
    if "payer_is_me" in expected:
        results["payer_is_me"] = output.get("payer_is_me", True) == expected["payer_is_me"]
    if "others" in expected:
        got = other_participants(output.get("participants") or [], me_name)
        results["others"] = got == {n.lower() for n in expected["others"]}
    if expected.get("needs_note"):
        results["needs_note"] = bool((output.get("notes_for_user") or "").strip())
    if "max_confidence" in expected:
        results["low_confidence"] = float(output.get("confidence", 1.0)) <= expected["max_confidence"]
    return results


def sanity_checks(output: dict, categories: str) -> dict[str, tuple[bool, str]]:
    """Reference-free checks any extraction must pass. Run on every live trace.

    `categories` is the comma-separated list the prompt offered (the chain's
    `categories` input). Returns key -> (passed, comment).
    """
    checks: dict[str, tuple[bool, str]] = {}

    amount = output.get("amount")
    checks["amount_valid"] = (
        amount is None or float(amount) > 0,
        f"amount={amount}",
    )
    if amount is None:
        note = (output.get("notes_for_user") or "").strip()
        checks["missing_amount_explained"] = (bool(note), "amount is null; notes_for_user must say why")

    currency = output.get("currency") or ""
    checks["currency_valid"] = (bool(CURRENCY_RE.match(currency)), f"currency={currency!r}")

    raw_date = output.get("date")
    try:
        date_ok = raw_date is None or bool(date.fromisoformat(raw_date))
    except (TypeError, ValueError):
        date_ok = False
    checks["date_valid"] = (date_ok, f"date={raw_date!r}")

    category = output.get("category_name")
    offered = {c.strip().lower() for c in categories.split(",") if c.strip()}
    checks["category_in_list"] = (
        category is None or category.lower() in offered,
        f"category_name={category!r}",
    )

    split = output.get("split_type", SplitType.EQUAL)
    split = getattr(split, "value", split)
    checks["split_type_valid"] = (
        split in {s.value for s in SplitType},
        f"split_type={split!r}",
    )
    return checks
