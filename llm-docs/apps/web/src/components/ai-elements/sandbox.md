# apps/web/src/components/ai-elements/sandbox.tsx

**Purpose:** Collapsible code-sandbox panel with header status badge and tabbed content.

**Key contents:** `Sandbox`, `SandboxHeader`, `SandboxContent`, `SandboxTabs*`, `SandboxTabContent`.

**Depends on / used by:** Imports `getStatusBadge` from `./tool`; uses `@settle/ui` collapsible and tabs.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
