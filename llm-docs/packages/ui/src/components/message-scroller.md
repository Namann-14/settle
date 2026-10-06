# packages/ui/src/components/message-scroller.tsx

**Purpose:** Chat transcript scroller that sticks to the bottom and offers a jump-to-latest button.

**Key contents:** Wraps `@shadcn/react/message-scroller` (Provider, Root, content, scroll-to-bottom button using ArrowDownIcon + Button).

**Depends on / used by:** Depends on button, `cn`, lucide-react, `@shadcn/react`. Used by the AI chat UI with message.tsx.

**Decisions & caveats:** Relies on the separate `@shadcn/react` package, unlike the other components which use Base UI. Client component.
