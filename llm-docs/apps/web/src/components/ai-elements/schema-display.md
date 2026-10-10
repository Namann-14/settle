# apps/web/src/components/ai-elements/schema-display.tsx

**Purpose:** Renders an HTTP API endpoint schema: method badge, path, parameters, request/response properties.

**Key contents:** `SchemaDisplay` with context-provided method/path, plus Header, Method, Path, Parameters, Request, Response, Property (recursive/collapsible) and Example parts.

**Depends on / used by:** Uses `@settle/ui` badge and collapsible.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
