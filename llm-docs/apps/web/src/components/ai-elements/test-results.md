# apps/web/src/components/ai-elements/test-results.tsx

**Purpose:** Test-run report UI: summary, progress bar, suites, individual tests with errors.

**Key contents:** `TestResults` (context-provided summary), Header, Duration, Summary, Progress, Content, `TestSuite*`, `Test*` parts.

**Depends on / used by:** Uses `@settle/ui` badge/collapsible.

**Decisions & caveats:** Vendored from the AI Elements registry (`@ai-elements` in apps/web/components.json); treat as generated code and prefer re-pulling over hand edits (Settle-specific styling is applied by callers, e.g. via className). Not imported anywhere in the app today; kept as part of the library.
