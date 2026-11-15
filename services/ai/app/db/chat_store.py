"""Chat history rows (ai_chat_threads / ai_chat_messages).

Every function is a no-op (or returns nothing) without a database, so the
chat still works in in-memory mode — there's just no history to show.

`parts` are stored in a small neutral shape, not the web's AI SDK types:
  {"type": "reasoning" | "text", "text": str}
  {"type": "tool", "id", "name", "args", "output", "error": bool,
   "approval"?: {"id": str, "approved": bool | None, "expense": dict}}
  (approved None = waiting for the user; expense = the preview they were shown)
  {"type": "suggestions", "items": [str, ...]}
"""

from __future__ import annotations

import uuid
from typing import Any

from psycopg.types.json import Jsonb

from app.db.persistence import get_pool


async def get_thread(thread_id: str) -> dict | None:
    pool = get_pool()
    if pool is None:
        return None
    async with pool.connection() as conn:
        cur = await conn.execute(
            "SELECT id, user_id, title, created_at, updated_at FROM ai_chat_threads WHERE id = %s",
            (thread_id,),
        )
        return await cur.fetchone()


async def ensure_thread(thread_id: str, user_id: str, title: str) -> None:
    pool = get_pool()
    if pool is None:
        return
    async with pool.connection() as conn:
        await conn.execute(
            "INSERT INTO ai_chat_threads (id, user_id, title) VALUES (%s, %s, %s) "
            "ON CONFLICT (id) DO NOTHING",
            (thread_id, user_id, title),
        )


async def list_threads(user_id: str, limit: int = 50) -> list[dict]:
    pool = get_pool()
    if pool is None:
        return []
    async with pool.connection() as conn:
        cur = await conn.execute(
            "SELECT id, title, created_at, updated_at FROM ai_chat_threads "
            "WHERE user_id = %s ORDER BY updated_at DESC LIMIT %s",
            (user_id, limit),
        )
        return await cur.fetchall()


async def get_messages(thread_id: str) -> list[dict]:
    pool = get_pool()
    if pool is None:
        return []
    async with pool.connection() as conn:
        cur = await conn.execute(
            "SELECT id, role, parts, checkpoint_id FROM ai_chat_messages "
            "WHERE thread_id = %s ORDER BY seq",
            (thread_id,),
        )
        return await cur.fetchall()


async def truncate_after_checkpoint(thread_id: str, checkpoint_id: str) -> None:
    """Drop every message after the assistant turn that ended at
    `checkpoint_id` — the history-side half of restoring a checkpoint (the
    graph forks from the same checkpoint)."""
    pool = get_pool()
    if pool is None:
        return
    async with pool.connection() as conn:
        await conn.execute(
            "DELETE FROM ai_chat_messages WHERE thread_id = %(t)s AND seq > ("
            "  SELECT seq FROM ai_chat_messages WHERE thread_id = %(t)s AND checkpoint_id = %(c)s"
            "  ORDER BY seq DESC LIMIT 1"
            ")",
            {"t": thread_id, "c": checkpoint_id},
        )


async def append_turn(
    thread_id: str,
    *,
    user_text: str,
    assistant_parts: list[dict[str, Any]],
    checkpoint_id: str | None,
) -> None:
    pool = get_pool()
    if pool is None:
        return
    async with pool.connection() as conn, conn.transaction():
        cur = await conn.execute(
            "SELECT coalesce(max(seq), -1) + 1 AS next FROM ai_chat_messages WHERE thread_id = %s",
            (thread_id,),
        )
        seq = (await cur.fetchone())["next"]
        await conn.execute(
            "INSERT INTO ai_chat_messages (id, thread_id, seq, role, parts, checkpoint_id) VALUES "
            "(%s, %s, %s, 'user', %s, NULL), (%s, %s, %s, 'assistant', %s, %s)",
            (
                str(uuid.uuid4()), thread_id, seq, Jsonb([{"type": "text", "text": user_text}]),
                str(uuid.uuid4()), thread_id, seq + 1, Jsonb(assistant_parts), checkpoint_id,
            ),
        )
        await conn.execute("UPDATE ai_chat_threads SET updated_at = now() WHERE id = %s", (thread_id,))
        await _claim_expenses(conn, thread_id, seq + 1)


async def get_last_assistant(thread_id: str) -> dict | None:
    """The newest assistant message: a turn paused for approval resumes into it."""
    pool = get_pool()
    if pool is None:
        return None
    async with pool.connection() as conn:
        cur = await conn.execute(
            "SELECT id, seq, parts, checkpoint_id FROM ai_chat_messages "
            "WHERE thread_id = %s AND role = 'assistant' ORDER BY seq DESC LIMIT 1",
            (thread_id,),
        )
        return await cur.fetchone()


async def update_assistant(
    thread_id: str,
    message_id: str,
    *,
    parts: list[dict[str, Any]],
    checkpoint_id: str | None,
) -> None:
    """Rewrite a paused assistant turn once it has been resumed."""
    pool = get_pool()
    if pool is None:
        return
    async with pool.connection() as conn, conn.transaction():
        cur = await conn.execute(
            "UPDATE ai_chat_messages SET parts = %s, checkpoint_id = %s "
            "WHERE id = %s AND thread_id = %s RETURNING seq",
            (Jsonb(parts), checkpoint_id, message_id, thread_id),
        )
        row = await cur.fetchone()
        await conn.execute("UPDATE ai_chat_threads SET updated_at = now() WHERE id = %s", (thread_id,))
        if row is not None:
            await _claim_expenses(conn, thread_id, row["seq"])


async def record_expense(thread_id: str, expense_id: str) -> None:
    """Note an expense the agent created in this thread. Its turn (message_seq)
    is filled in when the turn is saved."""
    pool = get_pool()
    if pool is None:
        return
    async with pool.connection() as conn:
        await conn.execute(
            "INSERT INTO ai_chat_expenses (expense_id, thread_id) VALUES (%s, %s) "
            "ON CONFLICT (expense_id) DO NOTHING",
            (expense_id, thread_id),
        )


async def _claim_expenses(conn, thread_id: str, seq: int) -> None:
    await conn.execute(
        "UPDATE ai_chat_expenses SET message_seq = %s WHERE thread_id = %s AND message_seq IS NULL",
        (seq, thread_id),
    )


async def expenses_after_checkpoint(thread_id: str, checkpoint_id: str) -> list[str]:
    """Expenses added by turns after the assistant turn that ended at
    `checkpoint_id` (plus any not yet tied to a turn). Restoring that
    checkpoint deletes them."""
    pool = get_pool()
    if pool is None:
        return []
    async with pool.connection() as conn:
        cur = await conn.execute(
            "SELECT expense_id FROM ai_chat_expenses WHERE thread_id = %(t)s AND ("
            "  message_seq IS NULL OR message_seq > ("
            "    SELECT seq FROM ai_chat_messages WHERE thread_id = %(t)s AND checkpoint_id = %(c)s"
            "    ORDER BY seq DESC LIMIT 1"
            "  )"
            ")",
            {"t": thread_id, "c": checkpoint_id},
        )
        return [r["expense_id"] for r in await cur.fetchall()]


async def forget_expenses(expense_ids: list[str]) -> None:
    pool = get_pool()
    if pool is None or not expense_ids:
        return
    async with pool.connection() as conn:
        await conn.execute("DELETE FROM ai_chat_expenses WHERE expense_id = ANY(%s)", (expense_ids,))


async def delete_thread(thread_id: str) -> None:
    pool = get_pool()
    if pool is None:
        return
    async with pool.connection() as conn:
        # ai_chat_messages rows go with it via ON DELETE CASCADE.
        await conn.execute("DELETE FROM ai_chat_threads WHERE id = %s", (thread_id,))
