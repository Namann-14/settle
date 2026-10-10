# services/ai/app/agents/chat_agent/nodes.py

**Purpose:** The single LLM-calling node of the chat graph.

**Key contents:** `call_model` binds CHAT_TOOLS to the chat model, builds the system prompt (today's date, user name, default currency from the runtime context) and invokes the model on system + conversation messages.

**Depends on / used by:** Uses llm/client.get_chat_model, prompts/chat.CHAT_SYSTEM, RequestContext, state.py.

**Decisions & caveats:** The system prompt is prepended per call and deliberately not stored in state, so it is not checkpointed or re-paid in tokens each turn.
