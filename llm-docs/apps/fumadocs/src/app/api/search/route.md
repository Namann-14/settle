# apps/fumadocs/src/app/api/search/route.ts

**Purpose:** Search endpoint for the docs UI.

**Key contents:** Exports `GET` built by `createFromSource(source)` with English language (Orama).

**Depends on / used by:** Uses `src/lib/source.ts`; called by the Fumadocs search dialog.

**Decisions & caveats:** Search index is built server-side from the source on demand.
