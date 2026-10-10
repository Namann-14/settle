# apps/web/src/components/landing/get-started-button.tsx

**Purpose:** Reusable CTA that adapts to auth state.

**Key contents:** Client component: signed-out shows a Clerk sign-up modal trigger, signed-in shows a link to /dashboard. Accepts `label` and required `className`.

**Depends on / used by:** Uses Clerk `Show`/`SignUpButton`; used by `ai-spotlight.tsx`, `footer.tsx`, `pricing.tsx` and others.

**Decisions & caveats:** Isolated as a tiny client island so the surrounding landing sections can stay server components.
