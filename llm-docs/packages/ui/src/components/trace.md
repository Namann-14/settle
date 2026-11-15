# packages/ui/src/components/trace.tsx

**Purpose:** Compact lines for agent activity: reasoning, tool calls and plan steps, each of which can expand.

**Key contents:** `Trace` (list), `TraceLine` (`status`: `"running" | "error" | "pending"`, or none when done), `TraceIcon`, `TraceTitle`, `TraceDescription`, `TraceCollapsible`, `TraceCollapsibleTrigger` (adds a chevron), `TraceCollapsibleContent` (muted detail under a left rule).

**Depends on / used by:** Uses collapsible, `cn`, lucide-react. Used by `apps/web/src/components/chat/assistant-message.tsx`.

**Decisions & caveats:** Added with `shadcn add trace` (shadcn AI Elements). The CLI wrote `import { cn } from "cn"` and added a bogus `cn` npm dependency; the import was changed to `@settle/ui/lib/utils` and the dependency removed. Check for this after the next shadcn add. A running line's title gets the `shimmer` utility from `shadcn/tailwind.css`. `TraceCollapsible` needs `onOpenChange` whenever `open` is passed.
