# apps/web/src/components/ai-elements/prompt-input.tsx

**Purpose:** Chat composer building blocks (textarea, toolbar, submit button, attachments) for AI chat UIs.

**Key contents:** Compound component `PromptInput` plus Body, Textarea, Header, Footer, Tools, Button, ActionMenu, Select, Submit parts; optional `PromptInputProvider` with attachment/referenced-source contexts; handles Enter-to-submit, paste/drop attachments and chat status (submit/stop icon).

**Depends on / used by:** Built on `@settle/ui` input-group, dropdown, select, spinner and the `ai` SDK types (`ChatStatus`, `FileUIPart`). Used by `chat/chat-panel.tsx` and `dashboard/ask-ai-card.tsx`.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Used actively. Large file (~1450 lines) - only the basic textarea/submit subset is used; attachments/provider code is dormant. `PromptInputButton` supports a `tooltip` with shortcut, used by chat-panel for the New chat button.
