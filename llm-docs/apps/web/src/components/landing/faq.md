# apps/web/src/components/landing/faq.tsx

**Purpose:** Landing FAQ section.

**Key contents:** Static `faqs` array rendered as `<details name="faq">` accordions (first open by default) next to a heading.

**Depends on / used by:** Uses `SectionBadge` from `section-heading.tsx`; rendered by the landing page.

**Decisions & caveats:** Native `<details>` with a shared `name` gives exclusive accordion behaviour with no JS. FAQ copy claims currency conversion, whereas decisions.md says totals are not converted and exchange rates are unused; verify before relying on it.
