from langgraph.graph import END, START, StateGraph

from app.agents.expense_extraction_agent.nodes import extract_fields, parse_source
from app.agents.expense_extraction_agent.state import ExpenseExtractionState

builder = StateGraph(ExpenseExtractionState)
builder.add_node("parse_source", parse_source)
builder.add_node("extract_fields", extract_fields)
builder.add_edge(START, "parse_source")
builder.add_edge("parse_source", "extract_fields")
builder.add_edge("extract_fields", END)

graph = builder.compile()
