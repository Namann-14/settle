"""
Wipe all app data from the database in DATABASE_URL, keeping the schema.

Kept: alembic_version, LangGraph's checkpoint_migrations, and the seeded
system categories. Users are recreated from Clerk on their next sign-in.

    uv run python -m scripts.reset_dev_data --yes

Irreversible. Never point this at a production database.
"""

import sys

from sqlalchemy import text

from app.db.base import Base
from app.db.session import engine

KEEP = {"alembic_version", "checkpoint_migrations"}


def main() -> None:
    if "--yes" not in sys.argv:
        print(__doc__)
        sys.exit(1)

    model_tables = {t.name for t in Base.metadata.sorted_tables}
    with engine.begin() as conn:
        # Children before parents, so plain DELETEs satisfy every foreign key.
        for table in reversed(Base.metadata.sorted_tables):
            if table.name == "categories":
                conn.execute(text("delete from categories where user_id is not null"))
            elif table.name not in KEEP:
                conn.execute(table.delete())

        # services/ai's tables (chat history, LangGraph checkpoints) have no models here.
        others = [
            row[0]
            for row in conn.execute(text("select tablename from pg_tables where schemaname = 'public'"))
            if row[0] not in model_tables and row[0] not in KEEP
        ]
        if others:
            conn.execute(text("truncate " + ", ".join(f'"{t}"' for t in others)))

    print(f"cleared {len(model_tables) - 1} app tables (system categories kept) and {len(others)} ai tables")


if __name__ == "__main__":
    main()
