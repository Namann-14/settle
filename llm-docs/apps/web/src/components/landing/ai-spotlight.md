# apps/web/src/components/landing/ai-spotlight.tsx

**Purpose:** Landing-page section promoting the AI assistant.

**Key contents:** Server component with a dark card: headline, copy, a `GetStartedButton`, and a mock chat/breakdown visual built from a static `breakdown` array.

**Depends on / used by:** Uses `get-started-button.tsx`; rendered by the landing page.

**Decisions & caveats:** Server-rendered on purpose (see decisions.md, faster first load); only the CTA button is a client component. Content is static marketing copy and mock data.
