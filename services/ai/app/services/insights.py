from __future__ import annotations

import statistics
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from app.schemas.insights import (
    Anomaly,
    CategoryBreakdown,
    GroupBreakdown,
    InsightsSummary,
    MerchantBreakdown,
    PeriodComparison,
)

# All arithmetic here is pure Python over already-fetched expense dicts — no
# LLM involved. The LLM only turns the resulting numbers into a sentence
# (app/chains/insights.py), so a wrong number is a bug in this file, never a
# hallucination.


def _parse_date(value: str) -> date:
    return datetime.fromisoformat(value).date() if "T" in value else date.fromisoformat(value)


def _in_window(expense: dict, start: date, end: date) -> bool:
    if expense.get("deleted_at"):
        return False
    d = _parse_date(expense["date"])
    return start <= d <= end


def _category_name(expense: dict, categories_by_id: dict[str, str]) -> str:
    cat_id = expense.get("category_id")
    return categories_by_id.get(str(cat_id), "Uncategorized") if cat_id else "Uncategorized"


def compute_summary(
    expenses: list[dict],
    *,
    categories_by_id: dict[str, str],
    groups_by_id: dict[str, str],
    days: int,
    currency: str,
    today: date | None = None,
) -> InsightsSummary:
    today = today or date.today()
    period_start = today - timedelta(days=days)
    prev_start = period_start - timedelta(days=days)

    current = [e for e in expenses if _in_window(e, period_start, today)]
    previous = [e for e in expenses if _in_window(e, prev_start, period_start - timedelta(days=1))]

    total = sum(Decimal(str(e["amount"])) for e in current)
    prev_total = sum(Decimal(str(e["amount"])) for e in previous)

    by_category: dict[str, Decimal] = defaultdict(Decimal)
    by_category_count: dict[str, int] = defaultdict(int)
    by_group: dict[str, Decimal] = defaultdict(Decimal)
    by_group_count: dict[str, int] = defaultdict(int)
    by_merchant: dict[str, Decimal] = defaultdict(Decimal)
    by_merchant_count: dict[str, int] = defaultdict(int)

    for e in current:
        amount = Decimal(str(e["amount"]))
        cat = _category_name(e, categories_by_id)
        by_category[cat] += amount
        by_category_count[cat] += 1
        if e.get("group_id"):
            gid = str(e["group_id"])
            by_group[gid] += amount
            by_group_count[gid] += 1
        if e.get("merchant"):
            by_merchant[e["merchant"]] += amount
            by_merchant_count[e["merchant"]] += 1

    if prev_total > 0:
        delta_pct = float((total - prev_total) / prev_total * 100)
        direction = "up" if delta_pct > 1 else "down" if delta_pct < -1 else "flat"
    else:
        delta_pct = None
        direction = "flat" if total == 0 else "up"

    return InsightsSummary(
        period_days=days,
        total_spent=float(total),
        currency=currency,
        by_category=[
            CategoryBreakdown(category_name=k, total=float(v), count=by_category_count[k])
            for k, v in sorted(by_category.items(), key=lambda kv: -kv[1])
        ],
        by_group=[
            GroupBreakdown(
                group_id=gid, group_name=groups_by_id.get(gid), total=float(v), count=by_group_count[gid]
            )
            for gid, v in sorted(by_group.items(), key=lambda kv: -kv[1])
        ],
        top_merchants=[
            MerchantBreakdown(merchant=m, total=float(v), count=by_merchant_count[m])
            for m, v in sorted(by_merchant.items(), key=lambda kv: -kv[1])[:5]
        ],
        expense_count=len(current),
        daily_average=float(total / days) if days else 0.0,
        vs_previous_period=PeriodComparison(delta_pct=delta_pct, direction=direction),
        narrative="",  # filled in by app/chains/insights.py
    )


def detect_anomalies(
    expenses: list[dict],
    *,
    categories_by_id: dict[str, str],
    days: int,
    today: date | None = None,
) -> list[Anomaly]:
    """Rule-based, not ML: z-score outliers within a category, >3x the
    category median, and same amount+merchant duplicated within 48h (a
    classic sign of an accidental double-charge or duplicate entry)."""
    today = today or date.today()
    window_start = today - timedelta(days=days)
    window = [e for e in expenses if _in_window(e, window_start, today)]

    by_category: dict[str, list[dict]] = defaultdict(list)
    for e in window:
        by_category[_category_name(e, categories_by_id)].append(e)

    anomalies: list[Anomaly] = []

    for cat, cat_expenses in by_category.items():
        amounts = [float(e["amount"]) for e in cat_expenses]
        if len(amounts) < 3:
            continue
        mean = statistics.mean(amounts)
        stdev = statistics.stdev(amounts)
        median = statistics.median(amounts)
        for e in cat_expenses:
            amount = float(e["amount"])
            z = (amount - mean) / stdev if stdev > 0 else 0.0
            if z > 2.5:
                anomalies.append(
                    Anomaly(
                        expense_id=str(e["id"]),
                        description=e["description"],
                        amount=amount,
                        reason=f"Unusually high for {cat} (z-score {z:.1f})",
                        severity="high" if z > 3.5 else "medium",
                        z_score=round(z, 2),
                    )
                )
            elif median > 0 and amount > median * 3:
                anomalies.append(
                    Anomaly(
                        expense_id=str(e["id"]),
                        description=e["description"],
                        amount=amount,
                        reason=f"More than 3x the typical {cat} expense",
                        severity="medium",
                        z_score=round(z, 2) if stdev > 0 else None,
                    )
                )

    seen: dict[tuple[str, str, str], dict] = {}
    for e in sorted(window, key=lambda x: x["date"]):
        key = (e.get("merchant") or e["description"], str(e["amount"]), "")
        prior = seen.get(key)
        if prior is not None:
            prior_date = _parse_date(prior["date"])
            this_date = _parse_date(e["date"])
            if abs((this_date - prior_date).days) <= 2:
                anomalies.append(
                    Anomaly(
                        expense_id=str(e["id"]),
                        description=e["description"],
                        amount=float(e["amount"]),
                        reason=f"Same amount and merchant as an expense on {prior_date.isoformat()} — possible duplicate",
                        severity="medium",
                        z_score=None,
                    )
                )
        seen[key] = e

    # de-dupe by expense_id in case an expense tripped more than one rule
    unique: dict[str, Anomaly] = {}
    for a in anomalies:
        unique.setdefault(a.expense_id, a)
    return list(unique.values())
