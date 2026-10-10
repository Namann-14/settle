# apps/web/src/lib/api/ai.ts

**Purpose:** Browser-side client for the Next `/api/ai/*` proxy routes (AI drafting, insights, settle plan).

**Key contents:** `draftExpenseFromText`, `draftExpenseFromVoice` (multipart upload, `recording.webm`), `getGroupInsight(groupId, days=30)`, `getSettlePlan(groupId?)`. Has its own local `handleResponse`.

**Depends on / used by:** Types in `types/ai.ts`; server side in `lib/ai.ts` and `app/api/ai/*`.

**Decisions & caveats:** Drafts are never saved by the AI; the UI must confirm and create the expense. Local `handleResponse` only reads `message`, unlike the shared one in `http.ts` which also reads FastAPI `detail`.
