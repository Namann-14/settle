from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.agents.chat_agent.nodes import call_model
from app.agents.chat_agent.state import ChatAgentState
from app.services.context import RequestContext
from app.tools import CHAT_TOOLS


def _tool_error(e: Exception) -> str:
    return f"Tool failed: {e}. Tell the user what went wrong; do not retry blindly."


def build_graph(checkpointer=None):
    builder = StateGraph(ChatAgentState, context_schema=RequestContext)
    builder.add_node("call_model", call_model)
    builder.add_node("tools", ToolNode(CHAT_TOOLS, handle_tool_errors=_tool_error))
    builder.add_edge(START, "call_model")
    builder.add_conditional_edges("call_model", tools_condition, {"tools": "tools", END: END})
    builder.add_edge("tools", "call_model")
    return builder.compile(checkpointer=checkpointer)


# Module-level singleton: the checkpointer must be shared across requests,
# otherwise every request would get a fresh, empty memory. This is
# single-process only (see README) — run uvicorn with --workers 1 until it's
# swapped for a Postgres-backed checkpointer.
CHECKPOINTER = InMemorySaver()
graph = build_graph(checkpointer=CHECKPOINTER)
