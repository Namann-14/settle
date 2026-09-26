from datetime import date as date_type, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.db.enums import Frequency


class RecurringCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=500)
    amount: Decimal = Field(..., gt=Decimal("0.00"))
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    category_id: UUID | None = None
    frequency: Frequency
    interval: int = Field(default=1, ge=1, le=12)
    start_date: date_type
    end_date: date_type | None = None

    @model_validator(mode="after")
    def _check_dates(self):
        if self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class RecurringUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1, max_length=500)
    amount: Decimal | None = Field(default=None, gt=Decimal("0.00"))
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    category_id: UUID | None = None
    frequency: Frequency | None = None
    interval: int | None = Field(default=None, ge=1, le=12)
    end_date: date_type | None = None
    is_active: bool | None = None


class RecurringResponse(BaseModel):
    id: UUID
    description: str
    amount: Decimal
    currency: str
    category_id: UUID | None = None
    frequency: Frequency
    interval: int
    start_date: date_type
    end_date: date_type | None = None
    next_run_date: date_type
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecurringSyncRequest(BaseModel):
    # The client's local date, so "due today" matches the user's calendar, not UTC.
    today: date_type


class RecurringSyncResponse(BaseModel):
    created: int
