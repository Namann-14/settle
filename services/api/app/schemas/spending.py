from datetime import date as date_type
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class CategorySpend(BaseModel):
    category_id: UUID | None = None
    name: str
    icon: str | None = None
    color: str | None = None
    amount: Decimal
    count: int
    budget: Decimal | None = None


class DailySpend(BaseModel):
    date: date_type
    amount: Decimal


class MonthSpend(BaseModel):
    month: str  # YYYY-MM
    amount: Decimal


class MerchantSpend(BaseModel):
    name: str
    amount: Decimal
    count: int


class CurrencyTotal(BaseModel):
    currency: str
    amount: Decimal


class SpendingSummary(BaseModel):
    """
    The user's spending for one month. "Spending" is the user's own share:
    the full amount of personal expenses plus their split of group expenses.
    Totals only count expenses in `currency`; others land in `other_currencies`.
    """

    month: str
    currency: str
    total: Decimal
    previous_total: Decimal
    expense_count: int
    personal_total: Decimal
    group_share_total: Decimal
    overall_budget: Decimal | None = None
    by_category: list[CategorySpend] = Field(default_factory=list)
    daily: list[DailySpend] = Field(default_factory=list)
    trend: list[MonthSpend] = Field(default_factory=list)
    top_merchants: list[MerchantSpend] = Field(default_factory=list)
    other_currencies: list[CurrencyTotal] = Field(default_factory=list)
    income_total: Decimal
    net: Decimal
