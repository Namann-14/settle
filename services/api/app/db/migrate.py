"""
Apply pending Alembic migrations at startup.

Only runs when RUN_MIGRATIONS_ON_STARTUP is set (production on Vercel, whose
database URL is a Sensitive env var nobody can read back to migrate by hand).
A Postgres advisory lock serialises concurrent cold starts; whoever gets it
second finds nothing left to do.
"""

import logging
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import text

from app.db.session import engine

logger = logging.getLogger(__name__)

ALEMBIC_INI = Path(__file__).resolve().parents[2] / "alembic.ini"
# arbitrary app-wide key for pg_advisory_lock
LOCK_KEY = 72_531_904


def upgrade_to_head() -> None:
    config = Config(str(ALEMBIC_INI))
    # Leave the app's logging alone (see alembic/env.py).
    config.attributes["configure_logger"] = False

    # Alembic chats at INFO on every cold start (plugin setup, dialect impl)
    # even when there is nothing to apply. Warnings and errors still get through.
    alembic_logger = logging.getLogger("alembic")
    previous_level = alembic_logger.level
    alembic_logger.setLevel(logging.WARNING)
    try:
        with engine.connect() as conn:
            conn.execute(text("select pg_advisory_lock(:k)"), {"k": LOCK_KEY})
            try:
                command.upgrade(config, "head")
            finally:
                conn.execute(text("select pg_advisory_unlock(:k)"), {"k": LOCK_KEY})
                conn.commit()
    finally:
        alembic_logger.setLevel(previous_level)
    logger.info("database migrated to head")
