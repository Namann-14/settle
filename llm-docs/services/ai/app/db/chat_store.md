# services/ai/app/db/chat_store.py

**Purpose:** Chat history storage (threads and messages) for the UI.

**Key contents:** Async functions: get_thread, ensure_thread, list_threads, get_messages, truncate_after_checkpoint, append_turn, get_last_assistant, update_assistant, delete_thread over `ai_chat_threads` / `ai_chat_messages`; record_expense, expenses_after_checkpoint, forget_expenses over `ai_chat_expenses`. Message `parts` are stored as neutral JSON (text, reasoning, tool, suggestions).

**Depends on / used by:** Uses db/persistence.get_pool; used by routes/chat.py.

**Decisions & caveats:** Every function no-ops or returns empty when there is no database (in-memory mode). Parts use a neutral shape instead of the web AI SDK types. truncate_after_checkpoint implements the history half of restoring an earlier checkpoint. Deleting a thread cascades to its messages and expense records (not to the expenses themselves). A tool part can carry `approval` {id, approved (null while waiting), expense preview}. Expenses are recorded with no turn and claimed by the turn that saves next (`append_turn` / `update_assistant` set `message_seq`); restoring deletes those with a later seq or none.
