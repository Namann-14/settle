# apps/web/src/hooks/useChatThreads.ts

**Purpose:** React Query hook wrapping an API client call so components get cached server state.

**Key contents:** `useChatThreads` lists chat threads (key `chat-threads`); `useDeleteChatThread` deletes one and invalidates the list; `useRestoreChatCheckpoint(chatId)` restores a checkpoint and, when expenses were rolled back, refreshes everything derived from expenses (`invalidateBalances`). Exports `CHAT_THREADS_KEY`.

**Depends on / used by:** `lib/api/chat.ts`; used by the AI chat UI thread list.

**Decisions & caveats:** Restore must go through the server (not just trim client messages) so the expenses are deleted when the user clicks Restore.
