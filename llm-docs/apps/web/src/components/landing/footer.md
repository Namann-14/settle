# apps/web/src/components/landing/footer.tsx

**Purpose:** Landing final call-to-action and site footer.

**Key contents:** `FinalCta` section with a `GetStartedButton`, and `Footer` with the `SettleLogo` and link columns (Product, Resources, Legal) driven by a static `columns` array.

**Depends on / used by:** Uses `get-started-button.tsx`; links to in-page anchors (#features, #how, #pricing, #faq), /dashboard and /privacy.

**Decisions & caveats:** The Terms link is a placeholder (`#`). The footer has `id="contact"` as an anchor target. Final CTA gets two slowly drifting blurred blobs (`.animate-drift`) and `.btn-shine`; footer links nudge on hover. Final CTA button is wrapped in `Magnet`.

**Redesign (2026-10-11):** Footer now has a brand block with a `Create a group` CTA (`Magnet`), three link columns (Product, App, Company) with slide-in underlines and a nudging external arrow, a soft top glow, a small bottom bar, and the `FooterWordmark` crop. Links point only at real routes/anchors. Footer content uses `max-w-[88rem]`, wider than the other sections (`max-w-6xl`) on purpose. Final CTA headline fills word by word on scroll (`ScrollWords`). Footer is now a sticky reveal: `sticky bottom-0 z-0` behind the page content, which scrolls away to uncover it (the page wrapper in `page.tsx` is `z-10` with rounded bottom corners and a shadow). Entrance animations use `FooterReveal`.
