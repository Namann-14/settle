from __future__ import annotations

import logging

from langgraph.checkpoint.base import BaseCheckpointSaver
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from app.core.config import settings

logger = logging.getLogger(__name__)

# Chat history for the UI, alongside LangGraph's own checkpoint tables (which
# AsyncPostgresSaver.setup() creates). Checkpoints are the model's memory;
# these rows are what the user saw — reasoning, tool steps, suggestions —
# which can't be rebuilt from checkpoints alone.
_SCHEMA = """
CREATE TABLE IF NOT EXISTS ai_chat_threads (
    id          text PRIMARY KEY,
    user_id     text NOT NULL,
    title       text NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_chat_threads_user_updated_idx
    ON ai_chat_threads (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id             text PRIMARY KEY,
    thread_id      text NOT NULL REFERENCES ai_chat_threads (id) ON DELETE CASCADE,
    seq            integer NOT NULL,
    role           text NOT NULL,
    parts          jsonb NOT NULL,
    checkpoint_id  text,
    created_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (thread_id, seq)
);
"""

_pool: AsyncConnectionPool | None = None
_checkpointer: BaseCheckpointSaver | None = None


async def init_persistence() -> None:
    global _pool, _checkpointer
    if not settings.database_url:
        logger.warning("DATABASE_URL not set: chats are kept in memory and lost on restart")
        _checkpointer = InMemorySaver()
        return

    _pool = AsyncConnectionPool(
        settings.database_url,
        min_size=1,
        max_size=5,
        open=False,
        # autocommit + dict_row are what AsyncPostgresSaver expects.
        # prepare_threshold=None disables server-side prepared statements,
        # which transaction-mode poolers (e.g. Neon's -pooler endpoint) break.
        kwargs={"autocommit": True, "prepare_threshold": None, "row_factory": dict_row},
    )
    await _pool.open()
    saver = AsyncPostgresSaver(_pool)
    await saver.setup()
    async with _pool.connection() as conn:
        await conn.execute(_SCHEMA)
    _checkpointer = saver


async def close_persistence() -> None:
    if _pool is not None:
        await _pool.close()


def get_pool() -> AsyncConnectionPool | None:
    """None when running without a database (in-memory mode)."""
    return _pool


def get_checkpointer() -> BaseCheckpointSaver:
    if _checkpointer is None:
        raise RuntimeError("init_persistence() has not run — is the app lifespan wired up?")
    return _checkpointer
