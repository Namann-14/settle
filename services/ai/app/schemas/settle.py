from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class SettlePlanRequest(BaseModel):
    group_id: str | None = Field(
        default=None,
        description="Plan for one group (every transfer in it). Omit for all the user's own transfers.",
    )


class PlannedTransfer(BaseModel):
    index: int
    group_id: str
    group_name: str | None = None
    currency: str
    from_user_id: str
    from_name: str | None = None
    to_user_id: str
    to_name: str | None = None
    amount: float
    direction: Literal["incoming", "outgoing", "others"]
    reminder: str | None = None


class SettlePlan(BaseModel):
    headline: str
    transfers: list[PlannedTransfer] = Field(default_factory=list)


class TopPayer(BaseModel):
    user_id: str
    name: str | None = None
    total: float
    is_me: bool = False


class GroupInsight(BaseModel):
    group_id: str
    group_name: str | None = None
    period_days: int
    currency: str
    total_spent: float
    expense_count: int
    top_category: str | None = None
    top_category_share_pct: float | None = None
    top_payer: TopPayer | None = None
    delta_pct: float | None = None
    narrative: str
