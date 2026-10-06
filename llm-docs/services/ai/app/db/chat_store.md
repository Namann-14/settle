# services/ai/app/db/chat_store.py

**Purpose:** Chat history storage (threads and messages) for the UI.

**Key contents:** Async functions: get_thread, ensure_thread, list_threads, get_messages, truncate_after_checkpoint, append_turn, delete_thread over `ai_chat_threads` / `ai_chat_messages`. Message `parts` are stored as neutral JSON (text, reasoning, tool, suggestions).

**Depends on / used by:** Uses db/persistence.get_pool; used by routes/chat.py.

**Decisions & caveats:** Every function no-ops or returns empty when there is no database (in-memory mode). Parts use a neutral shape instead of the web AI SDK types. truncate_after_checkpoint implements the history half of restoring an earlier checkpoint. Deleting a thread cascades to its messages.
