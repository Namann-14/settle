from __future__ import annotations

import calendar
from collections import defaultdict
from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers.exceptions import ValidationError
from app.models.user import User
from app.repositories import spending as spending_repo
from app.schemas.spending import (
    CategorySpend,
    CurrencyTotal,
    DailySpend,
    MerchantSpend,
    MonthSpend,
    SpendingSummary,
)

ZERO = spending_repo.ZERO


def _parse_month(month: str | None) -> tuple[int, int]:
    if not month:
        today = date.today()
        return today.year, today.month
    try:
        year, mon = (int(part) for part in month.split("-"))
        date(year, mon, 1)
    except ValueError as err:
        raise ValidationError("month must look like YYYY-MM") from err
    return year, mon


def _shift(year: int, month: int, delta: int) -> tuple[int, int]:
    index = year * 12 + (month - 1) + delta
    return index // 12, index % 12 + 1


def _bounds(year: int, month: int) -> tuple[date, date]:
    return date(year, month, 1), date(year, month, calendar.monthrange(year, month)[1])


def _key(d: date) -> str:
    return f"{d.year:04d}-{d.month:02d}"


def get_summary(db: Session, current_user: User, month: str | None, trend_months: int = 6) -> SpendingSummary:
    """
    The user's spending for one month: their share of every live expense in
    their default currency, with budgets, trend and income alongside.
    Three queries total: split rows for the whole window, budgets, income.
    """
    year, mon = _parse_month(month)
    start, end = _bounds(year, mon)
    month_key = _key(start)
    previous_key = _key(date(*_shift(year, mon, -1), 1))
    window_start, _ = _bounds(*_shift(year, mon, -max(trend_months - 1, 1)))
    currency = current_user.default_currency

    rows = spending_repo.split_rows(db, current_user.id, window_start, end)
    budgets = spending_repo.budgets_with_categories(db, current_user.id)
    income = spending_repo.income_total(db, current_user.id, currency, start, end)

    monthly: dict[str, Decimal] = defaultdict(lambda: ZERO)
    daily: dict[date, Decimal] = defaultdict(lambda: ZERO)
    merchants: dict[str, list] = defaultdict(lambda: [ZERO, 0])
    categories: dict[UUID | None, dict] = {}
    other: dict[str, Decimal] = defaultdict(lambda: ZERO)
    personal = group_share = ZERO
    count = 0

    for r in rows:
        key = _key(r.date)
        if r.currency != currency:
            if key == month_key:
                other[r.currency] += r.amount
            continue
        monthly[key] += r.amount
        if key != month_key:
            continue
        count += 1
        if r.personal:
            personal += r.amount
        else:
            group_share += r.amount
        daily[r.date] += r.amount
        merchants[r.label][0] += r.amount
        merchants[r.label][1] += 1
        cat = categories.setdefault(
            r.category_id,
            {
                "name": r.category_name or "Uncategorized",
                "icon": r.category_icon,
                "color": r.category_color,
                "amount": ZERO,
                "count": 0,
            },
        )
        cat["amount"] += r.amount
        cat["count"] += 1

    overall = next((b.amount for b in budgets if b.category_id is None), None)
    budget_by_category = {b.category_id: b.amount for b in budgets if b.category_id is not None}
    # Budgeted categories with no spend yet still belong on the budget board.
    for b in budgets:
        if b.category_id is not None and b.category_id not in categories and b.category:
            categories[b.category_id] = {
                "name": b.category.name,
                "icon": b.category.icon,
                "color": b.category.color,
                "amount": ZERO,
                "count": 0,
            }

    by_category = sorted(
        (
            CategorySpend(category_id=cid, budget=budget_by_category.get(cid), **data)
            for cid, data in categories.items()
        ),
        key=lambda c: c.amount,
        reverse=True,
    )

    trend = []
    for offset in range(trend_months - 1, -1, -1):
        key = _key(date(*_shift(year, mon, -offset), 1))
        trend.append(MonthSpend(month=key, amount=monthly.get(key, ZERO)))

    total = personal + group_share
    top = sorted(merchants.items(), key=lambda item: item[1][0], reverse=True)[:5]

    return SpendingSummary(
        month=month_key,
        currency=currency,
        total=total,
        previous_total=monthly.get(previous_key, ZERO),
        expense_count=count,
        personal_total=personal,
        group_share_total=group_share,
        overall_budget=overall,
        by_category=by_category,
        daily=[DailySpend(date=d, amount=a) for d, a in sorted(daily.items())],
        trend=trend,
        top_merchants=[MerchantSpend(name=name, amount=a, count=n) for name, (a, n) in top],
        other_currencies=[CurrencyTotal(currency=c, amount=a) for c, a in other.items()],
        income_total=income,
        net=income - total,
    )
