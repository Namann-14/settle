"""replace the WhatsApp bot link with a Telegram one

The WhatsApp Cloud API needs a verified business, so the bot moved to
Telegram. No WhatsApp link ever went live, so its columns and message log are
dropped rather than migrated.

Revision ID: a4f1c8d2e6b3
Revises: 7c3e9a41b2d8
Create Date: 2026-09-27 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a4f1c8d2e6b3'
down_revision: Union[str, Sequence[str], None] = '7c3e9a41b2d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index('ix_whatsapp_messages_user_id', table_name='whatsapp_messages')
    op.drop_index('ix_whatsapp_messages_from_phone', table_name='whatsapp_messages')
    op.drop_table('whatsapp_messages')
    op.drop_index('ix_users_whatsapp_link_code', table_name='users')
    op.drop_constraint('uq_users_whatsapp_phone', 'users', type_='unique')
    op.drop_column('users', 'whatsapp_link_code_expires_at')
    op.drop_column('users', 'whatsapp_link_code')
    op.drop_column('users', 'whatsapp_linked_at')
    op.drop_column('users', 'whatsapp_phone')

    op.add_column('users', sa.Column('telegram_chat_id', sa.BigInteger(), nullable=True))
    op.add_column('users', sa.Column('telegram_username', sa.String(length=64), nullable=True))
    op.add_column('users', sa.Column('telegram_linked_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('telegram_link_code', sa.String(length=16), nullable=True))
    op.add_column(
        'users', sa.Column('telegram_link_code_expires_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_unique_constraint('uq_users_telegram_chat_id', 'users', ['telegram_chat_id'])
    op.create_index('ix_users_telegram_link_code', 'users', ['telegram_link_code'])

    op.create_table(
        'telegram_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('update_id', sa.BigInteger(), nullable=False),
        sa.Column('chat_id', sa.BigInteger(), nullable=False),
        sa.Column('kind', sa.String(length=16), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('expense_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('draft_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['expense_id'], ['expenses.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['draft_id'], ['ai_expense_drafts.id'], ondelete='SET NULL'),
        sa.UniqueConstraint('update_id', name='uq_telegram_messages_update_id'),
    )
    op.create_index('ix_telegram_messages_chat_id', 'telegram_messages', ['chat_id'])
    op.create_index('ix_telegram_messages_user_id', 'telegram_messages', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_telegram_messages_user_id', table_name='telegram_messages')
    op.drop_index('ix_telegram_messages_chat_id', table_name='telegram_messages')
    op.drop_table('telegram_messages')
    op.drop_index('ix_users_telegram_link_code', table_name='users')
    op.drop_constraint('uq_users_telegram_chat_id', 'users', type_='unique')
    op.drop_column('users', 'telegram_link_code_expires_at')
    op.drop_column('users', 'telegram_link_code')
    op.drop_column('users', 'telegram_linked_at')
    op.drop_column('users', 'telegram_username')
    op.drop_column('users', 'telegram_chat_id')

    op.add_column('users', sa.Column('whatsapp_phone', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('whatsapp_linked_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('whatsapp_link_code', sa.String(length=8), nullable=True))
    op.add_column(
        'users', sa.Column('whatsapp_link_code_expires_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_unique_constraint('uq_users_whatsapp_phone', 'users', ['whatsapp_phone'])
    op.create_index('ix_users_whatsapp_link_code', 'users', ['whatsapp_link_code'])
    op.create_table(
        'whatsapp_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('wamid', sa.String(length=128), nullable=False),
        sa.Column('from_phone', sa.String(length=20), nullable=False),
        sa.Column('kind', sa.String(length=16), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('expense_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('draft_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['expense_id'], ['expenses.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['draft_id'], ['ai_expense_drafts.id'], ondelete='SET NULL'),
        sa.UniqueConstraint('wamid', name='uq_whatsapp_messages_wamid'),
    )
    op.create_index('ix_whatsapp_messages_from_phone', 'whatsapp_messages', ['from_phone'])
    op.create_index('ix_whatsapp_messages_user_id', 'whatsapp_messages', ['user_id'])
