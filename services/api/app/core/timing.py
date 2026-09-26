"""
Per-request timing: total wall time plus how many SQL statements ran and how
long they took. Emitted as a Server-Timing header (visible in the browser's
network tab) and one log line per request, so slow endpoints are easy to spot.
"""

from __future__ import annotations

import logging
import time
from contextvars import ContextVar

from sqlalchemy import event
from sqlalchemy.engine import Engine
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

# Child of uvicorn's logger so the lines show up with its INFO-level handler.
logger = logging.getLogger("uvicorn.error").getChild("timing")

# A mutable dict per request: sync routes run in a threadpool with a copy of
# the context, so they can't rebind the var, but they can update what it holds.
_stats: ContextVar[dict | None] = ContextVar("request_db_stats", default=None)


def install_query_timing(engine: Engine) -> None:
    @event.listens_for(engine, "before_cursor_execute")
    def _before(conn, cursor, statement, parameters, context, executemany):
        conn.info.setdefault("query_start", []).append(time.perf_counter())

    @event.listens_for(engine, "after_cursor_execute")
    def _after(conn, cursor, statement, parameters, context, executemany):
        started = conn.info["query_start"].pop()
        stats = _stats.get()
        if stats is not None:
            stats["queries"] += 1
            stats["db_ms"] += (time.perf_counter() - started) * 1000


class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        stats = {"queries": 0, "db_ms": 0.0}
        token = _stats.set(stats)
        started = time.perf_counter()
        try:
            response = await call_next(request)
        finally:
            _stats.reset(token)
        total_ms = (time.perf_counter() - started) * 1000
        response.headers["Server-Timing"] = (
            f'total;dur={total_ms:.1f}, db;dur={stats["db_ms"]:.1f};desc="{stats["queries"]} queries"'
        )
        logger.info(
            "%s %s %d %.0fms (db %.0fms, %d queries)",
            request.method,
            request.url.path,
            response.status_code,
            total_ms,
            stats["db_ms"],
            stats["queries"],
        )
        return response
