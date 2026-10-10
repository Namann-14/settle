# apps/fumadocs/src/app/llms-full.txt/route.ts

**Purpose:** Serves `/llms-full.txt`, the full docs content concatenated for LLMs.

**Key contents:** Collects `getLLMText` for every page and joins them.

**Depends on / used by:** Uses `src/lib/source.ts`.

**Decisions & caveats:** Statically generated (`revalidate = false`).
