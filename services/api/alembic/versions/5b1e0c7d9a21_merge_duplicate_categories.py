"""merge custom categories that duplicate a system category

Before system categories were seeded, users created their own "Food & Dining",
"Travel", ... Those now sit next to the identical system category, splitting
spend and budgets across two rows. Fold each one into the system category:
repoint its expenses, recurring expenses and budgets, then drop it.

Revision ID: 5b1e0c7d9a21
Revises: 342fca98de7d
Create Date: 2026-09-27 03:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5b1e0c7d9a21'
down_revision: Union[str, Sequence[str], None] = '342fca98de7d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# custom category id -> system category id with the same name
DUPLICATES = """
    SELECT c.id AS custom_id, s.id AS system_id, c.user_id
    FROM categories c
    JOIN categories s
      ON s.user_id IS NULL AND lower(s.name) = lower(c.name)
    WHERE c.user_id IS NOT NULL
"""


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text(f"""
        UPDATE expenses e SET category_id = d.system_id
        FROM ({DUPLICATES}) d WHERE e.category_id = d.custom_id
    """))
    conn.execute(sa.text(f"""
        UPDATE recurring_expenses r SET category_id = d.system_id
        FROM ({DUPLICATES}) d WHERE r.category_id = d.custom_id
    """))
    # A user may already budget the system category; keep that one and drop
    # the budget on the duplicate, otherwise move it across.
    conn.execute(sa.text(f"""
        DELETE FROM budgets b USING ({DUPLICATES}) d
        WHERE b.category_id = d.custom_id
          AND EXISTS (
            SELECT 1 FROM budgets o WHERE o.user_id = b.user_id AND o.category_id = d.system_id
          )
    """))
    conn.execute(sa.text(f"""
        UPDATE budgets b SET category_id = d.system_id
        FROM ({DUPLICATES}) d WHERE b.category_id = d.custom_id
    """))
    conn.execute(sa.text(f"DELETE FROM categories WHERE id IN (SELECT custom_id FROM ({DUPLICATES}) d)"))


def downgrade() -> None:
    # The merge is one-way: the custom rows carried nothing but their name.
    pass
