# apps/web/src/components/ai-elements/sources.tsx

**Purpose:** Collapsible 'Used N sources' list with link items for citing web sources.

**Key contents:** `Sources`, `SourcesTrigger`, `SourcesContent`, `Source`.

**Depends on / used by:** Uses `@settle/ui` collapsible.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library. Settle's agent has no web-search tool.
