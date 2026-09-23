from app.tools.analytics import get_my_balances, get_spending_summary
from app.tools.categories import list_my_categories
from app.tools.expenses import get_expense_details, list_my_expenses
from app.tools.groups import get_group_members, list_my_groups
from app.tools.settlements import list_my_settlements

CHAT_TOOLS = [
    list_my_expenses,
    get_expense_details,
    list_my_groups,
    get_group_members,
    list_my_categories,
    list_my_settlements,
    get_my_balances,
    get_spending_summary,
]

__all__ = ["CHAT_TOOLS"]
