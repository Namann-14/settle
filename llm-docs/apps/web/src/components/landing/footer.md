# apps/web/src/components/landing/footer.tsx

**Purpose:** Landing final call-to-action and site footer.

**Key contents:** `FinalCta` section with a `GetStartedButton`, and `Footer` with link columns (Product, Resources, Legal) driven by a static `columns` array.

**Depends on / used by:** Uses `get-started-button.tsx`; links to in-page anchors (#features, #how, #pricing, #faq), /dashboard and /privacy.

**Decisions & caveats:** The Terms link is a placeholder (`#`). The footer has `id="contact"` as an anchor target.
