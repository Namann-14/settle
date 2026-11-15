# packages/ui/src/components/item.tsx

**Purpose:** A row of media, content and actions, for list items and inline prompts.

**Key contents:** `Item` (variant default/outline/muted, size default/sm/xs, `render` for links), `ItemGroup`, `ItemSeparator`, `ItemMedia` (variant default/icon/image), `ItemContent`, `ItemTitle`, `ItemDescription`, `ItemActions`, `ItemHeader`, `ItemFooter`.

**Depends on / used by:** Base UI `useRender` / `mergeProps`, separator, `cn`. Used by `apps/web/src/components/chat/expense-confirmation.tsx`.

**Decisions & caveats:** Added with `shadcn add item`. Like trace, the CLI wrote `import { cn } from "cn"` and added a bogus `cn` dependency; both were fixed. It also offered to overwrite `separator.tsx`, which was declined, so answer no to that prompt.
