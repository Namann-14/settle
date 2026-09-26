from datetime import date as date_type, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class IncomeCreate(BaseModel):
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    date: date_type
    source: str = Field(..., min_length=1, max_length=200)
    notes: str | None = None


class IncomeUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=Decimal("0.00"))
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    date: date_type | None = None
    source: str | None = Field(default=None, min_length=1, max_length=200)
    notes: str | None = None


class IncomeResponse(BaseModel):
    id: UUID
    amount: Decimal
    currency: str
    date: date_type
    source: str
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
