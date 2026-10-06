# apps/fumadocs/src/app/llms.txt/route.ts

**Purpose:** Serves `/llms.txt`, an index of docs pages for LLMs.

**Key contents:** Returns `llms(source).index()`.

**Depends on / used by:** Uses `src/lib/source.ts`.

**Decisions & caveats:** Statically generated (`revalidate = false`).
