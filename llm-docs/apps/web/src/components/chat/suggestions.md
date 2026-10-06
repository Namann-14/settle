# apps/web/src/components/chat/suggestions.ts

**Purpose:** Shared list of starter chat prompts.

**Key contents:** Exports `CHAT_SUGGESTIONS`, four read-only questions (who owes me, monthly spending, recent expenses, my groups).

**Depends on / used by:** Used by `chat/chat-panel.tsx`, `dashboard/ask-ai-card.tsx`, `dashboard/home-composer.tsx`.

**Decisions & caveats:** Suggestions are questions only because the AI agent currently has only read-only tools; update them if write tools are added.
