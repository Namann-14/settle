# apps/web/src/components/dashboard/nav-chats.tsx

**Purpose:** Sidebar 'Recent chats' list of past chat threads with delete.

**Key contents:** `NavChats` lists threads from `useChatThreads` with loading/error/empty states, active highlighting and a hover delete action (muted, oxblood on hover) opening a confirm dialog.

**Depends on / used by:** Uses `@/hooks/useChatThreads`, `@/lib/chat-types`, `@settle/ui` sidebar/dialog. Rendered by `app-sidebar.tsx`.

**Decisions & caveats:** Hidden when the sidebar collapses to icons since identical chat icons are useless. Deleting the currently open thread redirects to /dashboard. State changes are colour-only 150ms transitions.
