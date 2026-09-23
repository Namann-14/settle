from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.agents.chat_agent.nodes import call_model
from app.agents.chat_agent.state import ChatAgentState
from app.db.persistence import get_checkpointer
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


# For LangGraph Studio (langgraph.json), which supplies its own persistence.
graph = build_graph()

_chat_graph = None


def get_chat_graph():
    """The graph the chat routes run, bound to the app's checkpointer
    (Postgres, or in-memory without DATABASE_URL). Built on first use because
    the checkpointer only exists once the app lifespan has started."""
    global _chat_graph
    if _chat_graph is None:
        _chat_graph = build_graph(checkpointer=get_checkpointer())
    return _chat_graph
