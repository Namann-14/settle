# apps/web/src/components/chat/chat-panel.tsx

**Purpose:** Full chat screen: message list, composer, suggestions and keyboard shortcuts, wired to the AI SDK `useChat`.

**Key contents:** `ChatPanel` uses `useChat` with a `DefaultChatTransport` to `/api/chat`, renders messages (user text via MessageResponse, assistant via `AssistantMessage`), checkpoints, empty-state suggestions or model-provided follow-ups (`data-suggestions` parts), the prompt box, and a shortcut hint line.

**Depends on / used by:** Uses ai-elements (conversation, message, checkpoint, prompt-input, suggestion, shimmer), `chat/assistant-message.tsx`, `suggestions.ts`, `use-chat-shortcuts.ts`, `@/hooks/useChatThreads`, `@/lib/chat-types`. Rendered by the dashboard chat pages.

**Decisions & caveats:** `chatId` doubles as the AI service thread id so memory and history follow it. An initial `?q=` prompt (from the home composer or Ask AI card) is sent once on mount, guarded by a ref against StrictMode double effects, then removed with `history.replaceState` to avoid re-asking on refresh without disturbing the stream. 'Restore checkpoint' only truncates client messages; the next request carries the checkpointId so the ai service forks from it. The modifier key label is resolved after mount to avoid hydration mismatch. New chat navigates to /dashboard (home composer).
