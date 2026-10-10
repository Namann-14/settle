# services/ai/app/agents/chat_agent/graph.py

**Purpose:** Builds the LangGraph for the conversational chat agent.

**Key contents:** `build_graph(checkpointer)`: START -> call_model -> (tools_condition) -> ToolNode(CHAT_TOOLS) -> back to call_model, until no tool calls. Exposes a module-level `graph` for LangGraph Studio and lazy `get_chat_graph()` bound to the app checkpointer.

**Depends on / used by:** Uses nodes.py, state.py, db/persistence.get_checkpointer, app.tools.CHAT_TOOLS, services.context.RequestContext. Used by routes/chat.py.

**Decisions & caveats:** Graph is built lazily because the checkpointer only exists after the app lifespan starts. Tool errors are returned to the model as text instead of raising, with an instruction not to retry blindly. The Studio `graph` has no checkpointer (Studio supplies its own).
