# apps/web/src/components/landing/how-it-works.tsx

**Purpose:** Landing 'how it works' three-step section.

**Key contents:** Static `steps` array rendered as an ordered grid; the last step is highlighted with the primary colour.

**Depends on / used by:** Uses `section-heading.tsx`; rendered by the landing page.

**Decisions & caveats:** Server component with static copy. Steps and the showcase use `Reveal`/`Spotlight` from `motion.tsx`; the steps list is now a `div` grid (was `ol`). Showcase card is now `DebtCollapse` from `page-extras.tsx`; step numbers shift and tint on hover; sections use `scroll-mt-20`. A `TraceLine` draws above the steps as you scroll. Steps are now `BentoCard`s with interactive demos (`InviteDemo`, `AddMethodsDemo`, `SettleUpDemo`) instead of big numerals; the `Step N` eyebrow stays because the steps really are a sequence. Steps stack until `lg` (three across at tablet width made the cards ~210px wide); the trace line shows from `lg`.
