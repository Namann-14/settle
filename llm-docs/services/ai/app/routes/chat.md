# services/ai/app/routes/chat.py

**Purpose:** Chat endpoints: blocking and streaming (SSE) chat plus thread management.

**Key contents:** POST /chat, POST /chat/stream, GET /chat/threads, GET/DELETE /chat/threads/{id}, GET /chat/conversations/{id}, GET /chat/ping. Stream emits conversation_id, reasoning, delta, tool_call, tool_result, checkpoint_id, suggestions, then [DONE]. Helpers prepare the turn, authorize the thread, and manage checkpoints.

**Depends on / used by:** Uses chat_agent graph, chains/followups, db/chat_store, db/persistence, routes/deps.BearerToken, services.context.

**Decisions & caveats:** Another user's thread returns 404 so ids can't be probed. Passing a checkpoint_id forks the thread from that point and truncates stored history. If a stream was cancelled mid tool-call, `_close_dangling_tool_calls` adds error ToolMessages so the next turn is a valid transcript. The turn is saved even when the client disconnects (Stop), with unfinished tools marked stopped. Tool output shown to the UI is truncated to 2000 chars; the model still sees the full output. Thread titles are the first 80 chars of the first message.
