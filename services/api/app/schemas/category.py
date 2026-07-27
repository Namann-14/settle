from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(..., max_length=100)
    is_system: bool = False
    user_id: UUID | None = None


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    is_system: bool
    user_id: UUID | None = None

    model_config = ConfigDict(from_attributes=True)
