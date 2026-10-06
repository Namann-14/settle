# apps/web/src/components/dashboard/ask-ai-card.tsx

**Purpose:** Dark promo card on the overview that hands a question to the chat page.

**Key contents:** `AskAiCard` with heading, a `PromptInput`, and the first three `CHAT_SUGGESTIONS`; submitting pushes `/dashboard/chat?q=...`.

**Depends on / used by:** Uses ai-elements prompt-input/suggestion, `chat/suggestions.ts`, `dashboard/panel.tsx`. Overview page.

**Decisions & caveats:** Entry point only: no chat state lives here, the chat page sends the prompt on mount. The shared PromptInput is restyled via className from here so the library file stays untouched.
