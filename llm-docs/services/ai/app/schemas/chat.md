# services/ai/app/schemas/chat.py

**Purpose:** Request/response models for the conversational chat agent.

**Key contents:** `ChatRequest` (`message` or `approvals`, optional `conversation_id`, optional `checkpoint_id`), `ApprovalAnswer` (interrupt id, approved), `RestoreRequest` (checkpoint_id), `ToolCallTrace` (tool name, args, result preview), `ChatResponse` (conversation_id, reply, tool_calls).

**Depends on / used by:** The chat endpoint and `agents/chat_agent`.

**Decisions & caveats:** `checkpoint_id` resumes from an earlier LangGraph checkpoint, forking the thread; this is how the UI restores an earlier point in a chat. Omitting `conversation_id` starts a new conversation. Exactly one of `message` / `approvals` is required, and `approvals` needs the `conversation_id` of the paused turn.
