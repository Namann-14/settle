"""group invites need consent, plus a shareable join link

Invitations to people who already have an account used to add them straight
away; now every invite waits for the invitee to accept or decline (DECLINED is
the new status). Groups get a nullable join_code for a shareable join link.

Revision ID: e2b7d4c91f05
Revises: a4f1c8d2e6b3
Create Date: 2026-10-31 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2b7d4c91f05'
down_revision: Union[str, Sequence[str], None] = 'a4f1c8d2e6b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ALTER TYPE ... ADD VALUE can't run inside a transaction block.
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE invitation_status ADD VALUE IF NOT EXISTS 'DECLINED'")

    op.add_column('groups', sa.Column('join_code', sa.String(length=32), nullable=True))
    op.create_unique_constraint('uq_groups_join_code', 'groups', ['join_code'])


def downgrade() -> None:
    op.drop_constraint('uq_groups_join_code', 'groups', type_='unique')
    op.drop_column('groups', 'join_code')
    # Postgres can't drop an enum value; fold DECLINED back into CANCELLED.
    op.execute("UPDATE group_invitations SET status = 'CANCELLED' WHERE status = 'DECLINED'")
