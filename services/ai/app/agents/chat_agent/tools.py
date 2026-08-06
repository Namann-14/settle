from langchain_core.tools import tool


@tool
def get_group_balances(group_id: str) -> str:
    """Look up outstanding balances for a group."""
    raise NotImplementedError
