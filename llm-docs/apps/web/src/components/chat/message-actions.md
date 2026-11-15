# apps/web/src/components/chat/message-actions.tsx

**Purpose:** Action buttons for chat messages.

**Key contents:** `MessageAction` is a ghost `icon-sm` Button inside a Tooltip; its label is also the aria-label. `CopyAction` copies the reply and shows a check for two seconds.

**Depends on / used by:** `@settle/ui` button and tooltip, sonner. Used by `chat/chat-panel.tsx` in each message's `MessageFooter`.

**Decisions & caveats:** Follows shadcn AI Elements' Message pattern. Good/Bad feedback is not implemented because there is no backend to store it.
