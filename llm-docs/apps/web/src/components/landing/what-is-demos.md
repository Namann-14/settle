# apps/web/src/components/landing/what-is-demos.tsx

**Purpose:** The three interactive illustrations in the "What is Settle?" cards.

**Key contents:** `SplitCoinArt` (coin splits into two `₹800` halves on scroll-in and on hover; friends orbit it), `SettleLine` (balance line goes noisy when an expense lands, then settles flat; hover to replay), `AutoToggle` (accessible switch; a dashed ring with a riding dot turns while on).

**Depends on / used by:** `coin.tsx`, `motion/react`; used by `what-is-settle.tsx`.

**Decisions & caveats:** `SettleLine` writes the path straight to the DOM from an `animate()` loop (no per-frame renders). Orbit/ring spins use CSS and are disabled under reduced motion. Amounts are sample data. `SplitCoinArt` is re-seated between title and copy below `md` and scaled to 0.72 so the orbit does not overlap the text.
