from __future__ import annotations

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: str | None = Field(
        default=None, description="Omit to start a new conversation"
    )


class ToolCallTrace(BaseModel):
    name: str
    args: dict
    result_preview: str


class ChatResponse(BaseModel):
    conversation_id: str
    reply: str
    tool_calls: list[ToolCallTrace] = Field(default_factory=list)
