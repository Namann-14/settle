# services/ai/app/db/persistence.py

**Purpose:** Sets up Postgres persistence: LangGraph checkpointer and chat-history schema.

**Key contents:** `init_persistence` opens an async psycopg pool, runs AsyncPostgresSaver.setup() and creates the chat tables; falls back to InMemorySaver without DATABASE_URL. Also close_persistence, get_pool, get_checkpointer.

**Depends on / used by:** Uses core/config; called from main.py lifespan; used by chat_store and chat_agent/graph.

**Decisions & caveats:** Pool uses `prepare_threshold=None` because transaction-mode poolers like Neon's -pooler break prepared statements, and autocommit + dict_row as AsyncPostgresSaver requires. Checkpoints are the model's memory; the ai_chat_* tables hold what the user saw (reasoning, tool steps). Tables are separate from services/api's, so the same database can be shared. Schema is created inline, not via migrations.
