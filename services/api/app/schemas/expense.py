from datetime import date as date_type, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.db.enums import SplitType
from app.schemas.expense_split import ExpenseSplitCreate, ExpenseSplitResponse


class ExpenseCreate(BaseModel):
    description: str = Field(..., max_length=500)
    merchant: str | None = Field(default=None, max_length=255)
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    currency: str = Field(default="INR", min_length=3, max_length=3)
    date: date_type
    notes: str | None = None
    split_type: SplitType
    group_id: UUID | None = None
    category_id: UUID | None = None
    paid_by_id: UUID
    created_by_id: UUID
    splits: list[ExpenseSplitCreate] = Field(default_factory=list)


class ExpenseUpdate(BaseModel):
    description: str | None = Field(default=None, max_length=500)
    merchant: str | None = Field(default=None, max_length=255)
    amount: Decimal | None = Field(default=None, gt=Decimal("0.00"))
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    date: date_type | None = None
    notes: str | None = None
    split_type: SplitType | None = None
    group_id: UUID | None = None
    category_id: UUID | None = None
    paid_by_id: UUID | None = None
    splits: list[ExpenseSplitCreate] | None = None


class ExpenseResponse(BaseModel):
    id: UUID
    description: str
    merchant: str | None = None
    amount: Decimal
    currency: str
    date: date_type
    notes: str | None = None
    split_type: SplitType
    deleted_at: datetime | None = None
    group_id: UUID | None = None
    category_id: UUID | None = None
    paid_by_id: UUID
    created_by_id: UUID
    recurring_expense_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
    splits: list[ExpenseSplitResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
