# apps/web/src/components/ai-elements/suggestion.tsx

**Purpose:** Horizontal scrolling row of suggestion chips for follow-up prompts.

**Key contents:** `Suggestions` (scroll area wrapper) and `Suggestion` (pill button that calls `onClick(suggestion)`).

**Depends on / used by:** Uses `@settle/ui` button/scroll-area. Used by `chat/chat-panel.tsx` and `dashboard/ask-ai-card.tsx`.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Used actively.
