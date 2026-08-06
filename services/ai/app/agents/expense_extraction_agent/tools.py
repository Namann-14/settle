from langchain_core.tools import tool


@tool
def lookup_category(text: str) -> str:
    """Map free text to a known expense category."""
    raise NotImplementedError
