# services/ai/app/agents/expense_extraction_agent/graph.py

**Purpose:** Two-step LangGraph pipeline for expense extraction.

**Key contents:** START -> parse_source -> extract_fields -> END, compiled as `graph`.

**Depends on / used by:** Uses nodes.py and state.py. Intended for LangGraph Studio.

**Decisions & caveats:** Not used by production routes; see nodes.py caveat.
