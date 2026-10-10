# services/api/app/models/__init__.py

**Purpose:** Imports every ORM model so they register with `Base.metadata`.

**Key contents:** Imports and `__all__` for AIExpenseDraft, Budget, Category, ChatConversation/ChatMessage, ExchangeRate, Expense, ExpenseSplit, Group, GroupMember, GroupInvitation, Income, RecurringExpense(+Split), Settlement, TelegramMessage, User.

**Depends on / used by:** `db/base.py` wildcard import, `alembic/env.py`.

**Decisions & caveats:** A new model must be added here, otherwise Alembic autogenerate will not see it.
