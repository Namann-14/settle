from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class MemberBalance(BaseModel):
    user_id: UUID
    user_name: str | None = None
    user_email: str | None = None
    net: Decimal


class Transfer(BaseModel):
    from_user_id: UUID
    to_user_id: UUID
    amount: Decimal


class GroupBalancesResponse(BaseModel):
    group_id: UUID
    currency: str
    members: list[MemberBalance] = Field(default_factory=list)
    transfers: list[Transfer] = Field(default_factory=list)
