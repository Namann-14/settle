from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ExpenseSplitCreate(BaseModel):
    user_id: UUID
    amount_owed: Decimal = Field(..., ge=Decimal("0.00"))
    percentage: Decimal | None = Field(default=None, ge=Decimal("0.00"), le=Decimal("100.00"))
    share: Decimal | None = Field(default=None, ge=Decimal("0.00"))


class ExpenseSplitUpdate(BaseModel):
    amount_owed: Decimal | None = Field(default=None, ge=Decimal("0.00"))
    percentage: Decimal | None = Field(default=None, ge=Decimal("0.00"), le=Decimal("100.00"))
    share: Decimal | None = Field(default=None, ge=Decimal("0.00"))


class ExpenseSplitResponse(BaseModel):
    id: UUID
    expense_id: UUID
    user_id: UUID
    amount_owed: Decimal
    percentage: Decimal | None = None
    share: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)
