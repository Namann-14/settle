from __future__ import annotations

from pydantic import BaseModel, Field


class CategoryBreakdown(BaseModel):
    category_name: str
    total: float
    count: int


class GroupBreakdown(BaseModel):
    group_id: str
    group_name: str | None = None
    total: float
    count: int


class MerchantBreakdown(BaseModel):
    merchant: str
    total: float
    count: int


class PeriodComparison(BaseModel):
    delta_pct: float | None = None
    direction: str = "flat"


class InsightsSummary(BaseModel):
    period_days: int
    total_spent: float
    currency: str
    by_category: list[CategoryBreakdown] = Field(default_factory=list)
    by_group: list[GroupBreakdown] = Field(default_factory=list)
    top_merchants: list[MerchantBreakdown] = Field(default_factory=list)
    expense_count: int
    daily_average: float
    vs_previous_period: PeriodComparison
    narrative: str


class Anomaly(BaseModel):
    expense_id: str
    description: str
    amount: float
    reason: str
    severity: str
    z_score: float | None = None


class AnomaliesResponse(BaseModel):
    anomalies: list[Anomaly] = Field(default_factory=list)
    narrative: str


class Balance(BaseModel):
    counterparty_id: str
    counterparty_name: str | None = None
    net_amount: float
    direction: str = Field(description="'owes_you' or 'you_owe'")


class BalancesResponse(BaseModel):
    currency: str
    balances: list[Balance] = Field(default_factory=list)
    net_total: float
