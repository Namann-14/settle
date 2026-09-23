from __future__ import annotations

from pydantic import BaseModel, Field


class CategorizeRequest(BaseModel):
    description: str = Field(min_length=1, max_length=500)
    amount: float | None = None
    merchant: str | None = None


class CategorySuggestion(BaseModel):
    category_id: str | None = Field(
        default=None, description="UUID of a real category, or null if nothing matched"
    )
    category_name: str
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str | None = None


class CategorizeResponse(BaseModel):
    suggestion: CategorySuggestion
    alternatives: list[CategorySuggestion] = Field(default_factory=list)
