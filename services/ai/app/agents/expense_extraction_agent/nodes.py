from app.agents.expense_extraction_agent.state import ExpenseExtractionState


def parse_source(state: ExpenseExtractionState) -> dict:
    raise NotImplementedError


def extract_fields(state: ExpenseExtractionState) -> dict:
    raise NotImplementedError
