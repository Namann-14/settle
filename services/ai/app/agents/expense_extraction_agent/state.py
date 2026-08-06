from typing_extensions import TypedDict


class ExpenseExtractionState(TypedDict):
    source_type: str
    raw_input: str | None
    file_url: str | None
    parsed_payload: dict
    confidence_score: float | None
