# apps/web/src/components/landing/feature-demos.tsx

**Purpose:** Client components that make the landing feature cards' sample content interactive.

**Key contents:** `ConfirmActions` (self-confirms once in view, click toggles, click-spark burst), `CategoryCycle` (highlight walks the pills, hover takes over), `ReceiptScan` (lines stagger in under a scan line, total counts up), `CurrencyConvert`, `RecurringRows` (staggered rows, "next due" ping dot).

**Depends on / used by:** `motion.tsx` (`CountUp`, `Reveal`), `motion/react`, `lucide-react`; used by `features.tsx`.

**Decisions & caveats:** Content is illustrative sample data only. Sparks are plain DOM elements removed after their animation and are skipped under reduced motion. Timers only run while the card is in view. Count-ups were removed from here on purpose: `CountUp` is used once on the whole page (hero "You're owed"). Receipt total pops in; currency chip gets a one-time sheen.
