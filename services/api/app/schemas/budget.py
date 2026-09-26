from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BudgetUpsert(BaseModel):
    # null => the overall monthly budget
    category_id: UUID | None = None
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    currency: str | None = Field(default=None, min_length=3, max_length=3)


class BudgetResponse(BaseModel):
    id: UUID
    category_id: UUID | None = None
    amount: Decimal
    currency: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
