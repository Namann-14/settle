from langgraph.graph import END, START, StateGraph

from app.agents.chat_agent.nodes import call_model
from app.agents.chat_agent.state import ChatAgentState

builder = StateGraph(ChatAgentState)
builder.add_node("call_model", call_model)
builder.add_edge(START, "call_model")
builder.add_edge("call_model", END)

graph = builder.compile()
