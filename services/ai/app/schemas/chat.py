from __future__ import annotations

from pydantic import BaseModel, Field, model_validator


class ApprovalAnswer(BaseModel):
    id: str = Field(description="Interrupt id from the `approval_request` event")
    approved: bool


class ChatRequest(BaseModel):
    message: str | None = Field(default=None, min_length=1, max_length=4000)
    conversation_id: str | None = Field(
        default=None, description="Omit to start a new conversation"
    )
    checkpoint_id: str | None = Field(
        default=None,
        description=(
            "Resume from this checkpoint of the conversation instead of its latest "
            "state, forking the thread — used to restore an earlier point in the chat"
        ),
    )
    approvals: list[ApprovalAnswer] | None = Field(
        default=None,
        description=(
            "Answers to a turn paused for approval (e.g. add_expense). Sent instead "
            "of `message`; resumes that turn rather than starting a new one"
        ),
    )

    @model_validator(mode="after")
    def _message_or_approvals(self) -> ChatRequest:
        if bool(self.message) == bool(self.approvals):
            raise ValueError("send either `message` or `approvals`")
        if self.approvals and not self.conversation_id:
            raise ValueError("`approvals` needs the `conversation_id` of the paused turn")
        return self


class RestoreRequest(BaseModel):
    checkpoint_id: str


class ToolCallTrace(BaseModel):
    name: str
    args: dict
    result_preview: str


class ChatResponse(BaseModel):
    conversation_id: str
    reply: str
    tool_calls: list[ToolCallTrace] = Field(default_factory=list)
