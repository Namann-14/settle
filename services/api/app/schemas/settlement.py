from datetime import date as date_type, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SettlementCreate(BaseModel):
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    currency: str = Field(default="INR", min_length=3, max_length=3)
    note: str | None = None
    date: date_type
    group_id: UUID | None = None
    paid_by_id: UUID
    received_by_id: UUID
    created_by_id: UUID


class SettlementUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=Decimal("0.00"))
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    note: str | None = None
    date: date_type | None = None


class SettlementResponse(BaseModel):
    id: UUID
    amount: Decimal
    currency: str
    note: str | None = None
    date: date_type
    group_id: UUID | None = None
    paid_by_id: UUID
    received_by_id: UUID
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
