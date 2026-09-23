from __future__ import annotations

from datetime import date

from langchain_core.messages import SystemMessage
from langgraph.runtime import Runtime

from app.agents.chat_agent.state import ChatAgentState
from app.llm.client import get_chat_model
from app.prompts.chat import CHAT_SYSTEM
from app.services.context import RequestContext
from app.tools import CHAT_TOOLS


async def call_model(state: ChatAgentState, runtime: Runtime[RequestContext]) -> dict:
    """The one LLM-calling node in the graph.

    The system prompt is built fresh on every call and prepended here, not
    stored in state — storing it in state would get it checkpointed and
    re-paid (in tokens) on every single turn of a long conversation.
    """
    model = get_chat_model().bind_tools(CHAT_TOOLS)
    system = SystemMessage(
        content=CHAT_SYSTEM.format(
            today=date.today().isoformat(),
            user_name=runtime.context.user_name or "the user",
            default_currency=runtime.context.default_currency,
        )
    )
    response = await model.ainvoke([system, *state["messages"]])
    return {"messages": [response]}
