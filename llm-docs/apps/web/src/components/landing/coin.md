# apps/web/src/components/landing/coin.tsx

**Purpose:** Glossy green coin illustration with the split-coin mark struck into its face.

**Key contents:** `Coin` (pure SVG; `half="left" | "right"` clips to one half so the coin can split apart; `id` keeps gradient ids unique when several are on the page).

**Depends on / used by:** none; used by `what-is-demos.tsx`.

**Decisions & caveats:** Colours are fixed oklch greens, not theme tokens, because it is an illustration that must read on light and dark. Give every instance on a page a distinct `id`.
