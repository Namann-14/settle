# apps/web/src/components/ai-elements/web-preview.tsx

**Purpose:** Browser-like iframe preview with URL bar, navigation buttons and a console drawer.

**Key contents:** `WebPreview` context plus Navigation, NavigationButton, Url, Body (iframe), Console parts.

**Depends on / used by:** Uses `@settle/ui` button/input/collapsible/tooltip.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library. Rendering arbitrary URLs in an iframe would need CSP review before use.
